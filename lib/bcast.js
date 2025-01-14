'use strict';

let io;

function broadcast (obj) {
    io.sockets.emit('notification', obj);
}

broadcast.setup = function (_io) {
    io = _io;
};


module.exports = broadcast;