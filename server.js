import path, { dirname } from 'path';
import http from 'http';
import express from 'express';
import { Server } from 'socket.io';
import { formatMessage } from "./utils/messages.js";
import { userJoin, getCurrentUser, userLeave, getRoomUsers } from "./utils/users.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Set static folder
app.use(express.static(path.join(dirname(''), 'public')));

const botName = 'ChitChat Bot';
// Run when client connects
io.on('connection', socket => {
  socket.on('joinRoom', ({ username, room }) => {
    const user = userJoin(socket.id, username, room );

    socket.join(user.room);
    // Welcome a user
    socket.emit('message', formatMessage(botName, 'Welcome to ChitChat'));

    // Broadcast when an user connects
    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        formatMessage(botName,`${ user.username } has joined the chat`)
      );

    //Send users and room info
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room)
    })
  });

  // Listen for chatMessages
  socket.on('chatMessage', (msg) => {
    const user = getCurrentUser(socket.id);

    io.to(user.room).emit('message', formatMessage(user.username, msg));
  })

  //Runs when client disconnects
  socket.on('disconnect', () => {
    const user = userLeave(socket.id);

    if(user) {
      io.to(user.room).emit('message', formatMessage(
        botName,
        `${user.username} has left the chat`
      ));
      //Send users and room info
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
      })
    }
  });
})

const PORT = process.env.PORT || '3000';

server.listen(PORT, () => console.log(`Server running on port ${PORT}`))