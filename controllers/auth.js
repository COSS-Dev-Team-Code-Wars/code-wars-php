'use strict';

const util    = require(__dirname + '/../helpers/util');
const mysql   = require('anytv-node-mysql');
const winston = require('winston');



exports.login = function (req, res, next) {

    const data = util.get_data({
        username: '',
        password: ''
    }, req.body);

    const session = req.session;


    function start () {

        if (data instanceof Error) {
            return next(data);
        }

        winston.verbose('Checking username and password');

        mysql.use('cwars')
            .query(`
                SELECT type
                FROM users
                WHERE username = ?
                    AND password = SHA2(?, 512);
                `,
                [data.username, data.password],
                send_response
            )
            .end();
    }


    function send_response (err, result) {

        if (err) {
            winston.error('Error in logging in', err);
            return next(err);
        }

        if (result.length === 0) {
            return res.warn(400, {message: 'Invalid username or password'});
        }

        const type = result[0].type;

        session.username = data.username;
        session.type = type;

        res.send({type});
    }

    start();
};



exports.logout = function (req, res) {


    function start () {

        req.session.destroy();

        res.send({message: 'Logout successful'});
    }

    start();
};
