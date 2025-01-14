'use strict';

const logger      = require(__dirname + '/helpers/logger');
const config      = require(__dirname + '/config/config');
const bcast       = require(__dirname + '/lib/bcast');
const mysql       = require('anytv-node-mysql');
const session     = require('express-session');
const conn_redis  = require('connect-redis');
const body_parser = require('body-parser');
const socketio    = require('socket.io');
const express     = require('express');
const winston     = require('winston');
const morgan      = require('morgan');
const http        = require('http');


// create express app and attach it into socketio
const app    = express();
const server = http.Server(app);
const io     = socketio(server);


// set app config
config.use(process.env.NODE_ENV);
app.set('env', config.ENV);


// set session store
const redis_store = conn_redis(session);
config.SESSION.store = new redis_store(config.REDIS_DB);


// setup broadcaster
bcast.setup(io);


// configure mysql
mysql.set_logger(winston)
    .add('cwars', config.CWARS_DB, true);


winston.info('Starting', config.APP_NAME, 'on', config.ENV, 'environment');

// configure express app
app.set('case sensitive routing', true);
app.set('x-powered-by', false);
app.set('trust proxy', 1);

app.use(session(config.SESSION));

winston.verbose('Binding 3rd-party middlewares');
app.use(morgan('combined', {stream: {write: logger.info}}));
app.use(require('method-override')());
app.use(body_parser.urlencoded({extended: false}));
app.use(body_parser.json());
app.use(require('compression')());


winston.verbose('Binding custom middlewares');
app.use(require('anytv-node-cors')(config.CORS));

// serve static files
app.use(express.static(config.ASSETS_DIR));
app.use(express.static(config.VIEWS_DIR));
app.use(express.static(config.UPLOADS_DIR));

app.use(require(__dirname + '/lib/res_extended')());
// mount api
app.use('/api', require(__dirname + '/config/router')(express.Router()));
app.use(require('anytv-node-error-handler')(winston));

winston.info('Server listening on port', config.PORT);

server.listen(config.PORT);
