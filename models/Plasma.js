const mongoose = require('mongoose');

const PlasmaSchema = new mongoose.Schema({
    bloodGroup: {
        type: String,
        required: [true, 'Please choose a blood group'],
        enum: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']
    },

    amount: {
        type: Number,
        required: [true, 'Please enter an amount']
    },

    point: {
        type: mongoose.Schema.ObjectId,
        ref: 'Point',
        required: true
    }
});

module.exports = mongoose.model('Plasma', PlasmaSchema);