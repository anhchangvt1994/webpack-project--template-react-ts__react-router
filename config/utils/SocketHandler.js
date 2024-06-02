const http = require('http')
const { Server } = require('socket.io')
const { findFreePort, setPort } = require('./PortHandler')

const server = http.createServer()
const io = new Server(server)

let socket = null
const promiseIOConnection = new Promise(async (resolve) => {
	const SOCKET_IO_PORT = await findFreePort(3030)
	setPort(SOCKET_IO_PORT, 'SOCKET_IO_PORT')

	let callback = null
	io.on('connection', (initializeSocket) => {
		let sockets = {}
		// Save the list of all connections to a variable
		sockets[initializeSocket.io] = initializeSocket
		socket = initializeSocket

		// When disconnect, delete the socket with the variable
		initializeSocket.on('disconnect', () => {
			delete sockets[initializeSocket.id]
		})

		if (callback) {
			callback({ server, io, socket })
		} else {
			resolve({
				server,
				io,
				socket,
				setupCallback: function (fn) {
					callback = fn
				},
			})
		}
	})

	server.listen(SOCKET_IO_PORT)
})

module.exports = promiseIOConnection
