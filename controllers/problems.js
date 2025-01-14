'use strict';

const mysql   = require('anytv-node-mysql');
const winston = require('winston');



exports.get_all = function (req, res, next) {


    function start () {

        mysql.use('cwars')
            .query(
                `SELECT problem_id, body FROM problems`,
                send_response
            )
            .end();
    }


    function send_response (err, result) {

        if (err) {
            winston.error('Error in getting problems');
            return next(err);
        }

        res.send(result);
    }

    start();
};

