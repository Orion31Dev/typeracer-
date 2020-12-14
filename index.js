const express = require("express");
const app = express();
const http = require('http').createServer(app);
const fs = require('fs');
const io = require('socket.io')(http);

const dict = JSON.parse(fs.readFileSync('./public/scripts/dict-eng.json')).words;


const length = 35;
let rooms = [];

app.use(express.static("./public"));

app.get('/dict-eng.json', (req, res) => {
  res.sendFile('./public/scripts/dict-eng.json', {root: __dirname});
});

app.get('/', (req, res) => {
  res.sendFile('./public/index.html', {root: __dirname});
});

app.get('/:roomCode', (req, res) => {
  if (typeof rooms[req.params.roomCode] !== "undefined") {
    if (rooms[req.params.roomCode].sockets.length >= 2 || rooms[req.params.roomCode].started) {
      res.sendFile('./public/full.html', {root: __dirname});
      return;
    }
  }
  res.sendFile('./public/game.html', {root: __dirname});
});

http.listen(process.env.PORT || 3000);

io.on('connection', (socket) => {
  socket.userId = genId(5);
  socket.finishedTyping = false;

  console.log(socket.userId + ' connected');

  socket.on('join', (txt) => {
    let room = txt.split(':')[0];
    let username = txt.split(':')[1];

    socket.username = username;

    console.log(socket.userId + ' trying to join room ' + room);
    if (typeof rooms[room] === "undefined") rooms[room] = new Room(room);

    if (rooms[room].sockets.length >= 2) {
      return; // Max 2 per room
    }

    if (rooms[room].started) {
      return;
    }

    // Send new player opponents name, if opponent already joined
    if (rooms[room].sockets.length === 1) {
      socket.emit('opponent', rooms[room].sockets[0].username);
    }

    // Update sockets
    rooms[room].sockets.push(socket);
    socket.roomCode = room;

    console.log(socket.userId + ' admitted to ' + room);

    rooms[room].sockets.forEach(s => {
      if (s.userId !== socket.userId) {
        s.emit('opponent', username); // Let other players know the opponent's username
      }
    });

    if (rooms[room].sockets.length === 2) {
      rooms[room].sockets.forEach(s => s.emit('start', '5')); // Give signal to start in 5s
      rooms[room].started = true;
    }

    // Send text
    socket.emit('text', rooms[room].text);
  });

  socket.on('result', (txt) => {
    console.log(`sending result of ${socket.userId} [${txt}] to room ${socket.roomCode}`);
    socket.finishedTyping = true;

    let finish = 0;

    rooms[socket.roomCode].sockets.forEach(s => {
      if (s.userId !== socket.userId) s.emit('result', txt);
      if (s.finishedTyping) finish++;
    });

    console.log(finish);

    if (finish === rooms[socket.roomCode].sockets.length) {
      console.log(`restarting room ${socket.roomCode}`);

      rooms[socket.roomCode].text = genText(length);
      rooms[socket.roomCode].sockets.forEach(s => {
        s.emit('text', rooms[socket.roomCode].text);
        s.emit('start', '10');
        s.finishedTyping = false;
      });
    }
  });


  socket.on('disconnect', () => {
    // Remove disconnecting socket
    console.log(socket.userId + ' trying to disconnect');

    if (typeof socket.roomCode !== 'undefined') {
      console.log(socket.userId + ' disconnecting ' + socket.roomCode);
      rooms[socket.roomCode].sockets = rooms[socket.roomCode].sockets.filter((s) => s.userId !== socket.userId);
    }
  });

  socket.on('letter', (num) => {
    if (!Array.isArray(rooms[socket.roomCode].sockets)) return;

    rooms[socket.roomCode].sockets.forEach((s) => {
      if (s.userId !== socket.userId) s.emit('letter', num);
    });
  })
});

function genId(length) {
  let result = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

function genText(length) {
  let words = "";

  for (let i = 0; i < length; i++) {
    words += dict[randomRange(0, dict.length - 1)];
    if (i !== length - 1) words += " ";
  }

  return words;
}

function randomRange(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

class Room {
  code = "";
  sockets = [];
  text = "";

  constructor(code) {
    this.code = code;

    this.text = genText(length);
  }
}