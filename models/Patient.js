const crypto = require('crypto')
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const PatientSchema = new mongoose.Schema({
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
    bloodGroup: {
        type: String,
        required: [true, 'Please choose your blood group'],
        enum: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'],
    },
    isPreviouslyDiagnosed: {
        type: Boolean,
        default: 'false',
    },
    role: {
        type: String,
        default:"doctor"
    },
    address: {
        type: String
    },
    gender: {
        type: String,
        required: [true, 'Please choose your gender'],
        enum: ['Male', 'Female', 'M', 'F'],
    },
    phoneNumber: {
        type: String,
        maxlength: [15, 'Phone number cannot be longer than 15 numbers']
    },
    amount: {
        type: Number,
        default: 0,
        validate: {
            validator: function (v) {
                return v >= 0;
            },
            message: (props) => `${props.value} is not a valid amount to Donate!`,
        },
    },
    photo: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date
});

// Encrypt password using bcrypt
PatientSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
PatientSchema.methods.getSignedJwtToken = function () {
    return jwt.sign({
        id: this._id
    }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
};

// Match patient entered password to hashed password in database
PatientSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
}

// Generate and hash password token
PatientSchema.methods.getResetPasswordToken = function () {
    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');

    console.log(resetToken);

    // Hash token and set to resetPasswordToken field
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // Set expire
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    return resetToken;
}
module.exports = mongoose.model('Patient', PatientSchema);