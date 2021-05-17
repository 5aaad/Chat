const fs = require('fs');
const mongoose = require('mongoose');
const colors = require('colors');
const dotenv = require('dotenv');

// Load env vars
dotenv.config({
    path: './config/config.env'
});

// Load models
const Point = require('./models/Point');
const Plasma = require('./models/Plasma');
const Patient = require('./models/Patient');
const Review = require('./models/Review');


// Connect to DB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
});

// Read JSON file
const points = JSON.parse(fs.readFileSync(`${__dirname}/_data/points.json`, 'utf-8'));
const plasma = JSON.parse(fs.readFileSync(`${__dirname}/_data/plasma.json`, 'utf-8'));
const patient = JSON.parse(fs.readFileSync(`${__dirname}/_data/patient.json`, 'utf-8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/_data/reviews.json`, 'utf-8'));

// Import into DB
const importData = async function () {
    try {
        await Point.create(points);
        await Plasma.create(plasma);
        await Patient.create(patient);
        await Review.create(reviews);
        console.log('Data Imported...'.green.inverse);
        process.exit();
    } catch (err) {
        console.error(err);
    }
}

// Delete data
const deleteData = async function () {
    try {
        await Point.deleteMany();
        await Plasma.deleteMany();
        await Patient.deleteMany();
        await Review.deleteMany();
        console.log('Data Destroyed...'.green.inverse);
        process.exit();
    } catch (err) {
        console.error(err);
    }
}

if (process.argv[2] === '-i') {
    importData();
} else if (process.argv[2] === '-d') {
    deleteData();
}