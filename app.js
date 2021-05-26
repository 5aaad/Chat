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
const admin = require('./routes/admin');
const reviews = require('./routes/reviews');
const doctor = require('./routes/doctor');
const prediction = require('./routes/prediction');

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

// Run when client connects
io.on('connection', socket => {
  socket.on('joinRoom', ({
    username,
    room
  }) => {
    const user = userJoin(socket.id, username, room);

    socket.join(user.room);

    // Welcome current user
    socket.emit('message', formatMessage(botName, 'Welcome to COVID-19 Utility Chat!'));

    // Broadcast when a user connects
    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        formatMessage(botName, `${user.username} has joined the chat`)
      );

    // Send users and room info
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room)
    });
  });

  // Listen for chatMessage
  socket.on('chatMessage', msg => {
    const user = getCurrentUser(socket.id);

    io.to(user.room).emit('message', formatMessage(user.username, msg));
  });

  // Runs when client disconnects
  socket.on('disconnect', () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(
        'message',
        formatMessage(botName, `${user.username} has left the chat`)
      );

      // Send users and room info
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
      });
    }
  });
});

// COVID-19 API
// var worldWideCases;
// var worldWideTodayCases;
// var worldWideDeaths;
// var worldWideTodayDeaths;
// var worldWideRecovered;
// var worldWideTodayRecovered;
// var worldWideActive;
// var worldWideCritical;

// request("https://disease.sh/v3/covid-19/all", function (error, response, body) {
//   data = JSON.parse(body);
//   worldWideCases = data.cases;
//   worldWideTodayCases = data.todayCases;
//   worldWideDeaths = data.deaths;
//   worldWideTodayDeaths = data.todayDeaths;
//   worldWideRecovered = data.recovered;
//   worldWideTodayRecovered = data.todayRecovered;
//   worldWideActive = data.active;
//   worldWideCritical = data.critical;
// })

// var pakistanCases;
// var pakistanTodayCases;
// var pakistanDeaths;
// var pakistanTodayDeaths;
// var pakistanRecovered;
// var pakistanTodayRecovered;
// var pakistanActive;
// var pakistanCritical;

// request("https://disease.sh/v3/covid-19/countries/Pakistan?strict=true", function (error, response, body) {
//   data = JSON.parse(body);
//   pakistanCases = data.cases;
//   pakistanTodayCases = data.todayCases;
//   pakistanDeaths = data.deaths;
//   pakistanTodayDeaths = data.todayDeaths;
//   pakistanRecovered = data.recovered;
//   pakistanTodayRecovered = data.todayRecovered;
//   pakistanActive = data.active;
//   pakistanCritical = data.critical;
// })


//GET Routes

app.get("/", function (req, res) {
  res.render("welcome");
});

app.get('/register', function (req, res) {
  res.render('register');
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

covidPrediction = {};

app.get("/predictionCovid", function (req, res) {
  res.render('covidPrediction', {
    prediction: 'hi',
    probability: 'bye'
  });
})

app.get('/prediction', (req, res) => {
  res.render('covidImageUpload');
});

app.get('/donate', function (req, res) {
  res.render('donate');
});

app.get('/chat', async function (req, res, next) {
  const doctors = await Doctor.find();

  res.status(200).render('chat', {
    success: true,
    count: doctors.length,
    data: doctors
  });
});


// POST routes

app.post('/chat', async function (req, res) {
  // const sentMessage = req.body.sentMessage;
  // const participant1 = req.body.patientId;
  // const participant2 = req.body.doctorId;

  const chat = await Chat.create({
    message: req.body.sentMessage,
    patientId: req.body.patientId,
    doctorId: req.body.doctorId
  });
  res.status(200).json({
    success: true,
    data: chat
  })
});

app.post('/prediction', (req, res) => {
  // res.render('covidPrediction');

  image = {
    data: req.body.image
  };

  var json = JSON.stringify(image);
  fs.writeFile('./covid-model-files/image_json_file.json', json, 'utf8', function (err) {
    if (err) {
      console.log(err);
    }
  });

  const pythonFilePath = 'C:/Users/Saad Ur Rehman/Desktop/COVID19/covid-model-files/model.py';
  const imageFilePath = 'C:/Users/Saad Ur Rehman/Desktop/COVID19/covid-model-files/image_json_file.json';

  var commands = [
    'conda activate covid-site',
    'python ' + pythonFilePath + ' --infile ' + imageFilePath
  ];

  // var pythonProcess = exec(commands.join(' & '),
  //     	 function(error, stdout, stderr){
  //        		// console.log(error);
  //         	console.log(stdout);
  //         	// console.log(stderr);
  //     }
  // );
  var predictionOutput = {};

  async function pythonScript() {
    var pythonProcess = await exec_prom(commands.join(' & '),
      function (error, stdout, stderr) {
        // console.log(error);
        // console.log(stdout);
        // this.stdin.end();
        // this.stdout.destroy();
        // this.stderr.destroy()

        // console.log(stderr);
        predictionOutput = JSON.parse(stdout);
        console.log(predictionOutput);
        // res.redirect('/predictionCovid')
        // global.alert("Your result is "+predictionOutput.prediction);
        // res.render('covidPrediction', {prediction: 'hi', probability: 'bye'});
        res.redirect("predictionCovid");
      }
    );

    // pythonProcess.kill('SIGINT');
    //  pythonProcess.on('exit', function (code) {
    //     console.log("python process exited with code "+code);
    // });
  }
  pythonScript();

  // pythonProcess.stdout.on('data', function(data) {

  // 	predictionOutput = JSON.parse(data);

  //   res.render('covidPrediction', {prediction: predictionOutput.prediction, probability: predictionOutput.probability})

  // });

  // pythonProcess.on('exit', function (code) {
  //     console.log("python process exited with code "+code);
  // });

  // res.render('covidPrediction', {prediction: 'hi', probability: 'bye'});
  // res.redirect('predictionCovid');
});

// Mount routers
app.use('/points', points);
app.use('/plasmas', plasmas);
app.use('/auth', auth);
app.use('/doctor', doctor);
app.use('/api/v1/admin', admin);
app.use('/reviews', reviews);
app.use('/prediction', prediction)

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold));