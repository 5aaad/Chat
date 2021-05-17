const mongoose = require('mongoose');

const DoctorSchema = new mongoose.Schema({
    role: {
        type: String,
        enum: ['patient', 'doctor', 'admin', 'donationPoint'],
        default: 'admin',
    },
    name: {
        type: String,
        required: [true, 'Please add a name'],
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email',
        ],
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6,
        select: false
    },
    age: {
        type: String,
        required: [true, 'Please type your age'],
    },
    address: {
        type: String
    },
    gender: {
        type: String,
        required: [true, 'Please choose your gender'],
        enum: ['Male', 'Female'],
    },
    qualification: {
        type: String,
        required: [true, 'Please enter your qualification']
    },
    phoneNumber: {
        type: String,
        maxlength: [15, 'Phone number cannot be longer than 15 numbers']
    },
    photo: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Doctor', DoctorSchema);