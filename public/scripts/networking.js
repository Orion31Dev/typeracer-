const socket = io();

socket.emit('test', 'test msg');

function emit(evt, msg) {
  socket.emit(evt, msg);
}

function setCallback(evt, callback) {
  socket.on(evt, callback);
}
