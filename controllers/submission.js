'use strict';

const config  = require(__dirname + '/../config/config');
const util    = require(__dirname + '/../helpers/util');
const bcast   = require(__dirname + '/../lib/bcast');

const mysql   = require('anytv-node-mysql');
const winston = require('winston');
const mkdirp  = require('mkdirp');
const multer  = require('multer');
const fs      = require('fs');



exports.get_all = function (req, res, next) {

    const session = req.session;


    function start () {

        mysql.use('cwars')
            .query(`
                SELECT *
                  FROM submissions
                 WHERE (? = "team" AND team = ?)
                    OR (? = "judge" AND
                           (status = "pending evaluation"
                               OR (judge = ? AND status != "evaluated")
                           )
                       )
                    OR (? IN ("admin", "superadmin"));`,
                [
                    session.type,
                    session.username,
                    session.type,
                    session.username,
                    session.type
                ],
                send_response
            )
            .end();
    }

    function send_response (err, result) {

        if (err) {
            winston.error('Error in selecting submissions');
            return next(err);
        }

        res.send(result);
    }

    start();
};



exports.submit = function (req, res, next) {

    const username = req.session.username;
    let file;


    function start () {

        mysql.use('cwars')
            .query(`
                SELECT 1
                  FROM submissions
                 WHERE team = ?
                   AND problem_id = ?
                   AND (evaluation = "Correct"
                    OR status = "Pending evaluation")
                 LIMIT 1
                `,
                [
                    username,
                    req.params.id
                ],
                get_file
            )
            .end();
    }


    function get_file (err, result) {

        if (err) {
            winston.error('Error in checking for pending or correct submission');
            return next(err);
        }

        if (result.length) {
            return res.warn({
                message: `There's already a submitted file with pending evaluation or already correct`
            });
        }

        const upload = multer({
            limits: config.MULTER_LIMITS,
            storage: multer.diskStorage({

                // separate them by username
                destination: (_req, _file, cb) => {
                    let dir = config.UPLOADS_DIR + `/${username}/`;
                    mkdirp(dir, _err => cb(_err, dir));
                },

                // dont change filename
                filename: (_req, _file, cb) =>
                    cb(null, _file.originalname)
            })
        });

        upload.single('file')(req, res, insert_to_db);
    }


    function insert_to_db (err) {

        if (err) {
            winston.error('Error in uploading files', err);
            return next(err);
        }

        if (!req.file) {
            return res.warn(400, {message: 'file is missing'});
        }

        file = req.file;

        winston.verbose(`Received ${file.filename} from ${username}`);
        winston.debug(file);

        if (!~config.ALLOWED_FILETYPES.indexOf(file.mimetype)) {
            return next('Invalid file');
        }

        const submission = {
            team: req.session.username,
            problem_id: req.params.id,
            filename: file.filename,
            status: 'pending evaluation'
        };

        mysql.use('cwars')
            .args(submission)
            .query(`
                INSERT INTO submissions SET ?`,
                submission,
                send_response
            )
            .end();
    }


    function send_response (err, result, args) {

        const submission = args[0];

        if (err) {
            winston.error('Error in inserting new submission', submission, err);
            return next(err);
        }

        submission.submission_id = result.insertId;

        // tell all judges
        bcast({
            type: 'judge',
            event: 'submit',
            data: submission
        });

        res.send({
            message: 'File successfully submitted',
            submission
        });
    }

    start();
};



exports.evaluate = function (req, res, next) {

    const session = req.session;

    const data = util.get_data({
        evaluation: ''
    }, req.body);


    function start () {

        if (data instanceof Error) {
            return next(data);
        }

        mysql.use('cwars')
            .query(`
                UPDATE submissions
                   SET evaluation = ?,
                       status = "evaluated"
                 WHERE judge = ?
                   AND submission_id = ?
                 LIMIT 1`,
                [
                    data.evaluation,
                    session.username,
                    req.params.id
                ],
                send_response
            )
            .end();
    }


    function send_response (err) {

        if (err) {
            winston.error('Error in inserting evaluation', err);
            return next(err);
        }

        // tell everyone a file has been evaluated
        bcast({
            type: 'team',
            event: 'evaluate',
            data: {
                submission_id: req.params.id,
                evaluation: data.evaluation,
                status: 'evaluated'
            }
        });

        res.send({message: 'Submission successfully evaluated'});
    }

    start();
};



exports.preview = function (req, res, next) {

    const data = req.params;


    function start () {

        fs.readFile(
            `/${ config.UPLOADS_DIR }/${ data.id }/${ data.file }`,
            'utf8',
            send_response
        );
    }


    function send_response (err, result) {

        if (err) {
            winston.error('Error in reading file');
            return next(err);
        }

        res.header('Content-Type', 'text/plain');
        res.send(result);
    }

    start();
};



exports.take_over = function (req, res, next) {

    const session = req.session;
    const data = req.params;


    function start () {


        mysql.use('cwars')
            .query(`
                SELECT status
                  FROM submissions
                 WHERE submission_id = ?
                 LIMIT 1
                `,
                [data.id],
                check_status
            )
            .end();
    }


    function check_status (err, result) {

        if (err) {
            winston.error('Error in getting stauts of a submission', data);
            return next(err);
        }

        if (result.length === 0) {
            return next('Submission ID does not exist');
        }

        result = result[0];

        if (result.status !== 'pending evaluation') {
            return res.warn({
                message: 'Submission is no longer waiting for an evaluation'
            });
        }

        mysql.use('cwars')
            .query(`
                UPDATE submissions
                   SET status = "being evaluated",
                       judge = ?
                 WHERE submission_id = ?
                 LIMIT 1
                `,
                [
                    session.username,
                    data.id
                ],
                send_response
            )
            .end();
    }


    function send_response (err) {

        if (err) {
            winston.error('Error in setting status to being evaluated', data);
            return next(err);
        }

        bcast({
            type: 'judge',
            event: 'take_over',
            data: {
                judge: session.username,
                submission_id: data.id
            }
        });

        res.send({
            message: 'Submission successfully taken over'
        });
    }

    start();
};
