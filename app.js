// main backend/server application entry point

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const express = require('express');
const morgan = require('morgan');
const httpStatus = require('http-status');
const path = require('path');

require('dotenv').config();

// app setup
const app = express();
app.set('port', process.env.PORT);
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));

// routes
//require('./routes')(app);

// catch any remaining path (not found) and forward to error handler
app.use((req, res, next) => {
	const err = new Error('Not Found');
	err.status = httpStatus.NOT_FOUND;
	next(err);
});

// return the full error object in development
const getError = function(err) {
	// istanbul ignore else: tests are run in dev mode
	if (process.env.NODE_ENV === 'dev') {
		return { error: err, message: err.message };
	} else {
		return null;
	}
};

// TODO: route-specific error handling

// all other web errors return our app
app.use((err, req, res, next) => {
	//res.render('index.html');
	res.sendFile(__dirname + '/public/index.html');
});

module.exports = app;
