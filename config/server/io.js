const http = require("http");
const { Server } = require("socket.io");

const server = http.createServer();
const io = new Server(server);
const IO_PORT = process.env.IO_PORT || 3030;

let socket = null;
const promiseIOConnection = new Promise((resolve) => {
  let callback = null;
  io.on("connection", (initializeSocket) => {
    let sockets = {};
    // Save the list of all connections to a variable
    sockets[initializeSocket.io] = initializeSocket;
    socket = initializeSocket;

    // When disconnect, delete the socket with the variable
    initializeSocket.on("disconnect", () => {
      delete sockets[initializeSocket.id];
    });

    if (callback) {
      callback({ server, io, socket });
    } else {
      resolve({
        server,
        io,
        socket,
        setupCallback: function (fn) {
          callback = fn;
        },
      });
    }
  });
});

server.listen(IO_PORT);

module.exports = promiseIOConnection;
