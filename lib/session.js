'use strict';

function session_check (req, res, next) {

    if (typeof req === 'string') {
        return check_type.bind(null, req);
    }

    if (req.session && req.session.username) {
        return next();
    }

    res.warn(403, {
        message: 'what are you doing here'
    });
}


function check_type (type, req, res, next) {

    if (req.session
        && req.session.type
        && (req.session.type === type
            || req.session.type === 'superadmin')
    ) {
        return next();
    }

    res.warn(403, {
        message: 'what are you doing here'
    });
}


module.exports = session_check;
