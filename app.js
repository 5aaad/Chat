// jshint esversion: 6

const path = require("path")
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const request = require("request");
const http = require("http");
const mongoose = require("mongoose");
const socketio = require("socket.io");
const dotenv = require("dotenv");
const fileUpload = require('express-fileupload');
const cors = require("cors");
const errorHandler = require("./middleware/error");
const colors = require("colors");
const cookieParser = require('cookie-parser');
const connectDB = require("./controllers/db");
const debug = require('debug')('http');
const formatMessage = require('./utils/messages');
const {
	userJoin,
	getCurrentUser,
	userLeave,
	getRoomUsers
} = require('./utils/users');
const exec = require('child_process').exec;
const fs = require('fs');
const util = require('util');
let exec_prom = util.promisify(exec);
const app = express();
const server = http.createServer(app);
const io = socketio(server);
const botName = "COVID-19 Utility Bot";
const logger = require("./middleware/logger");
const Chat = require('./models/Chat');
const Doctor = require('./models/Doctor');

app.use(logger);
app.use(errorHandler);

// Route Files
const points = require('./routes/points');
const plasmas = require('./routes/plasmas');
const auth = require('./routes/auth');
const reviews = require('./routes/reviews');
const doctor = require('./routes/doctor');
const prediction = require('./routes/prediction');
const conversation = require('./routes/conversation');
const message = require('./routes/message');
const chat = require('./routes/chat');

// load env vars
dotenv.config({
	path: "./config/config.env"
});

// Connection to DB
connectDB();

// File upload
app.use(fileUpload());

// Body parser
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
	limit: '50mb',
	extended: true
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Cookie parser
app.use(cookieParser());

// Enable cors
app.use(cors());

// Chat Module

let users = [];

const addUser = (userId, socketId) => {
	!users.some((user) => user.userId === userId) &&
		users.push({
			userId,
			socketId
		});
};

const removeUser = (socketId) => {
	users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
	return users.find((user) => user.userId === userId);
};

io.on("connection", (socket) => {
	//when connect
	console.log("a user connected.");

	//take userId and socketId from user
	socket.on("addUser", (userId) => {
		console.log("i a from server")
		addUser(userId, socket.id);
		io.emit("getUsers", users);
	});

	//send and get message
	socket.on("sendMessage", ({
		senderId,
		receiverId,
		text
	}) => {

		const user = getUser(receiverId);
		if (user != undefined) {
			console.log("hhehe")
			io.to(user.socketId).emit("getMessage", {
				senderId,
				text,
			});
		}
	});

	// when disconnect
	socket.on("disconnect", () => {
		console.log("a user disconnected!");
		removeUser(socket.id);
		io.emit("getUsers", users);
	});
});

// COVID-19 API
var worldWideCases;
var worldWideTodayCases;
var worldWideDeaths;
var worldWideTodayDeaths;
var worldWideRecovered;
var worldWideTodayRecovered;
var worldWideActive;
var worldWideCritical;

request("https://disease.sh/v3/covid-19/all", function (error, response, body) {
	data = JSON.parse(body);
	worldWideCases = data.cases;
	worldWideTodayCases = data.todayCases;
	worldWideDeaths = data.deaths;
	worldWideTodayDeaths = data.todayDeaths;
	worldWideRecovered = data.recovered;
	worldWideTodayRecovered = data.todayRecovered;
	worldWideActive = data.active;
	worldWideCritical = data.critical;
})

var pakistanCases;
var pakistanTodayCases;
var pakistanDeaths;
var pakistanTodayDeaths;
var pakistanRecovered;
var pakistanTodayRecovered;
var pakistanActive;
var pakistanCritical;

request("https://disease.sh/v3/covid-19/countries/Pakistan?strict=true", function (error, response, body) {
	data = JSON.parse(body);
	pakistanCases = data.cases;
	pakistanTodayCases = data.todayCases;
	pakistanDeaths = data.deaths;
	pakistanTodayDeaths = data.todayDeaths;
	pakistanRecovered = data.recovered;
	pakistanTodayRecovered = data.todayRecovered;
	pakistanActive = data.active;
	pakistanCritical = data.critical;
})

//GET Routes

app.get("/", function (req, res) {
	res.render("welcome", {
		pakistanCases: pakistanCases,
		pakistanTodayCases: pakistanTodayCases,
		pakistanDeaths: pakistanDeaths,
		pakistanTodayDeaths: pakistanTodayDeaths,
		pakistanRecovered: pakistanRecovered,
		pakistanTodayRecovered: pakistanTodayRecovered,
		pakistanActive: pakistanActive,
		pakistanCritical: pakistanCritical,
		worldWideCases: worldWideCases,
		worldWideTodayCases: worldWideTodayCases,
		worldWideDeaths: worldWideDeaths,
		worldWideTodayDeaths: worldWideTodayDeaths,
		worldWideRecovered: worldWideRecovered,
		worldWideTodayRecovered: worldWideTodayRecovered,
		worldWideActive: worldWideActive,
		worldWideCritical: worldWideCritical
	});
});

app.get('/register', function (req, res) {
	res.render('register');
});

app.get('/chat-dashboard', function (req, res) {
	res.render('chatDashboard');
});

app.get('/doctors', async function (req, res, next) {
	const doctors = await Doctor.find();

	res.status(200).render('doctors', {
		success: true,
		data: doctors
	});
});

app.get('/registerDoctor', function (req, res) {
	res.render('registerDoctor');
});

app.get('/login', function (req, res) {
	res.render('login');
});

app.get('/resetPassword', function (req, res) {
	res.render('resetPassword');
})

app.get('/manageAccount', function (req, res) {
	res.render('manageAccount');
})

app.get('/api/v1/points/radius/', function (req, res) {
	res.render('index');
});

app.get('/createPoint', function (req, res) {
	res.render('createPoint');
});

app.get('/addReview', function (req, res) {
	res.render('addReview');
})

app.get('/updatePassword', function (req, res) {
	res.render('updatePassword');
});

app.get('/manageReviews', function (req, res) {
	res.render('manageReviews')
})

app.get("/home", function (req, res) {
	res.render('home');
});

app.get('/doctorHome', function (req, res) {
	res.render('doctorHome');
})

app.get("/index", function (req, res) {
	res.render('index');
});

app.get('/loginChoice', function (req, res) {
	res.render('loginChoice');
})

app.get('/registerChoice', function (req, res) {
	res.render('registerChoice');
});

app.get('/doctorLogin', function (req, res) {
	res.render('doctorLogin');
});

app.get('/prediction', (req, res) => {
	res.render('covidImageUpload');
});

app.get('/donate', function (req, res) {
	res.render('donate');
});

// Mount routers
app.use('/points', points);
app.use('/plasmas', plasmas);
app.use('/auth', auth);
app.use('/doctor', doctor);
app.use('/reviews', reviews);
app.use('/prediction', prediction);
app.use('/conversation', conversation);
app.use('/message', message);
app.use('/chat', chat);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold));