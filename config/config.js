'use strict';

const _      = require('lodash');
const path   = require('path');


const config = {

    APP_NAME: 'CodeWars',

    PORT: process.env.PORT || 5000,

    CORS:  {
        allowed_headers: 'Access-Token, X-Requested-With, Content-Type, Accept',
        allowed_origins: '*',
        allowed_methods: 'GET, POST, PUT, OPTIONS, DELETE',
        allow_credential: true,
        allowed_origins_list: [
            'dev.codewars.coss',
            'localhost'
        ]
    },

    UPLOADS_DIR: path.normalize(__dirname + '/../uploads'),
    ASSETS_DIR: path.normalize(__dirname + '/../assets'),
    VIEWS_DIR: path.normalize(__dirname + '/../views'),
    LOGS_DIR: path.normalize(__dirname + '/../logs'),

    USER_TYPES: [
        'team',
        'judge',
        'admin'
    ],

    ALLOWED_FILETYPES: [
        'application/octet-stream',
        'text/x-python-script',
        'text/plain'
    ],

    CWARS_DB: {
        host: 'localhost',
        user: 'root',
        password: 'wency',
        database: 'cwars'
    },

    REDIS_DB: {
        host: '127.0.0.1',
        port: 6379
    },

    SESSION: {
        secret: 'dubidubiduwapeygentpi',
        saveUninitialized: false,
        rolling: true,
        resave: false,
        name: '__utscr',
        cookie: {
            path: '/',
            httpOnly: true,
            secure: false
        }
    },

    MULTER_LIMITS: {
        // max of 10mb each file in bytes
        // 1kb -> 1mb -> 10mb
        fileSize: 1000 * 1000 * 10
    },

    use: (env) => {
        _.assign(config, require(__dirname + '/env/' + env));
        return config;
    }
};

if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'development';
}

module.exports = config.use(process.env.NODE_ENV);
