const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
    // messages: [{
    //     text: {
    //         type: String,
    //         max: 2000
    //     },
    //     isSender: {
    //         type: Boolean,
    //         default: 'participant1'
    //     },
    //     sender: {
    //         type: mongoose.Schema.Types.ObjectId,
    //         ref: 'isSender' ? 'participant1' : 'participant2'
    //     }
    // }],
    // participant1: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'Doctor'
    // },
    // participant2: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'Patient'
    // }
    message: String,
    patientId: String,
    doctorId: String


})

module.exports = mongoose.model('Chat', ChatSchema);