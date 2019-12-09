
const express = require('express');
const app = express();
const cert = require('./cert');
const https = require('https').Server(cert, app);
const io = require('socket.io')(https);
const port = process.env.PORT || 4000;

//var to count numbers of users
var numUsers = 0;

//Point to directory with client-facing files
app.use(express.static(__dirname + '/public'));

//On connection, run function onConnection
io.on('connection', onConnection);

//Listening for emits from client
https.listen(port, () => console.log('listening on port ' + port));


function onConnection(socket){
  //emit drawing data back to client
  socket.on('drawing', (data) => socket.broadcast.emit('drawing', data));

  //manage numUsers
  var addedUser = false;

  // when the client emits 'add user', this listens and executes
  socket.on('add user', (username) => {
    //end is users already added
    if (addedUser) return;

    console.log(username);
    // we store the name in the socket session for this client
    socket.name = username;
    ++numUsers;
    addedUser = true;

    //emit to client new user joined. Send object with user data
    socket.broadcast.emit('new user', {
      name: socket.name,
      id: socket.id
    });
  });


  // when the user disconnects.. perform this
  socket.on('disconnect', () => {
    //if user has been added
    if (addedUser) {
      --numUsers;

      // echo globally that this client has left
      socket.broadcast.emit('user left', {
        username: socket.name,
        numUsers: numUsers
      });
    }
  });
};
