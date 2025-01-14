'use strict';

const config  = require(__dirname + '/../config/config');
const util    = require(__dirname + '/../helpers/util');
const mysql   = require('anytv-node-mysql');
const winston = require('winston');



exports.get_all = function (req, res, next) {


    function start () {

        mysql.use('cwars')
            .query(`
                SELECT username,
                       type
                  FROM users
                 WHERE type != "superadmin";`,
                send_response
            )
            .end();
    }


    function send_response (err, result) {

        if (err) {
            winston.error('Error in getting users', err);
            return next(err);
        }

        res.send(result);
    }

    start();
};



exports.create_user = function (req, res, next) {

    const data = util.get_data({
        username: '',
        password: '',
        type: ''
    }, req.body);


    function start () {

        if (data instanceof Error) {
            return next(data);
        }

        if (!~config.USER_TYPES.indexOf(data.type)) {
            return res.warn(400, {message: 'Invalid type'});
        }

        mysql.use('cwars')
            .query(`
                INSERT INTO users (
                    username,
                    password,
                    type
                ) VALUES (?, SHA2(?, 512), ?)
                ON DUPLICATE KEY UPDATE
                password = SHA2(VALUES(password), 512)`,
                [
                    data.username,
                    data.password,
                    data.type
                ],
                send_response
            )
            .end();
    }


    function send_response (err) {

        if (err) {
            winston.error('Error in creating new user', err);
            return next(err);
        }

        res.send({message: 'User successfully upserted'});
    }

    start();
};



exports.delete_user = function (req, res, next) {

    const data = util.get_data({username: ''}, req.body);


    function start () {

        if (data instanceof Error) {
            return next(data);
        }

        mysql.use('cwars')
            .query(`
                DELETE FROM users
                 WHERE username = ?
                 LIMIT 1
                `,
                [data.username],
                send_response
            )
            .end();
    }


    function send_response (err) {

        if (err) {
            winston.error('Error in deleting user', err);
            return next(err);
        }

        res.send({message: 'User successfully deleted'});
    }

    start();
};



exports.change_password = function (req, res, next) {

    const data = util.get_data({
        username: '',
        password: ''
    }, req.body);


    function start () {

        if (data instanceof Error) {
            return next(data.message);
        }

        mysql.use('cwars')
            .query(`
                UPDATE users
                   SET password = SHA2(?, 512)
                 WHERE username = ?
                 LIMIT 1
                `,
                [data.password, data.username],
                send_response
            )
            .end();
    }


    function send_response (err) {

        if (err) {
            winston.error('Error in updating password', err);
            return next(err);
        }

        res.send({message: 'Password successfully changed'});
    }

    start();
};



exports.get_scores = function (req, res, next) {


    function start () {

        mysql.use('cwars')
            .query(`
                SELECT count(*) as score,
                       team
                  FROM submissions
                 WHERE evaluation = 'Correct'
              GROUP BY team
              ORDER BY score DESC
                `,
                send_response
            )
            .end();
    }


    function send_response (err, result) {

        if (err) {
            winston.error('Error in getting scores', err);
            return next(err);
        }

        res.send(result);
    }

    start();
};
