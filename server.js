// Node.js server entry point

const app = require('./app');
const debug = require('debug')('canvasdraw:server');
const http = require('http');

let server;

// event listener for http server error event
function onError(error) {
	console.log(error);
	if (error.syscall !== 'listen') {
		throw error;
	}
	const bind = typeof port === 'string'
		? 'Pipe ' + process.env.PORT
		: 'Port ' + process.env.PORT;
	// handle specific listen errors with friendly messages
	switch (error.code) {
		case 'EACCES':
			console.error(bind + ' requires elevated privileges');
			process.exit(1);
			break;
		case 'EADDRINUSE':
			console.error(bind + ' is already in use');
			process.exit(1);
			break;
		default:
			throw error;
	}
}

// event listener for http server listening event
function onListening() {
	const addr = server.address();
	const bind = typeof addr === 'string'
		? 'pipe ' + addr
		: 'port ' + addr.port;
	debug('Listening on ' + bind);
}

// create http server
function createServer(callback) {
	server = http.createServer(app);//https.createServer(cert, app);
	server.on('error', onError);
	server.on('listening', onListening);

	// socket.io
	io = require('socket.io').listen(server);

	io.on('connection', (socket) => {
		console.log('user connected');
		socket.on('disconnect', () => {
			console.log('user disconnected');
		});/*
		socket.on('add user', (msg) => {
			socket.broadcast.emit('new user', msg);
			console.log('message: ' + JSON.stringify(msg));
		});*/
		socket.on('drawing', (msg) => {
			socket.broadcast.emit('drawing', msg);
			console.log('message: ' + JSON.stringify(msg));
		});
	});

	server.listen(process.env.PORT, callback(server));
}

module.exports = createServer;
