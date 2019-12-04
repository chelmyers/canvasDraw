
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;

var numUsers = 0;

app.use(express.static(__dirname + '/public'));


io.on('connection', onConnection);

http.listen(port, () => console.log('listening on port ' + port));



function onConnection(socket){
  //emit drawing data back to client
  socket.on('drawing', (data) => socket.broadcast.emit('drawing', data));

  //manage numUsers
  var addedUser = false;

  // when the client emits 'add user', this listens and executes
  socket.on('add user', (name) => {
    if (addedUser) return;

    console.log(name);
    // we store the name in the socket session for this client
    socket.name = name;
    ++numUsers;
    addedUser = true;

    user = {
      n: name,
      id: socket.id
    }

    socket.broadcast.emit('new user', JSON.stringify(user));
  });


  // when the user disconnects.. perform this
  socket.on('disconnect', () => {
    if (addedUser) {
      --numUsers;

      // echo globally that this client has left
      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: numUsers
      });
    }
  });
};
