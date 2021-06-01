const express = require('express');
const {
    getChat,
    getInbox
} = require('../controllers/chat');

const router = express.Router();
const {
    protectPatient,
    authorizePatient
} = require('../middleware/auth');
const {
    protectDoctor,
    authorizeDoctor
} = require('../middleware/doctorAuth');

router.route('/chat')
    .get(protectPatient, protectDoctor, authorizeDoctor, authorizePatient, getChat)

router.route('/inbox')
    .get(protectPatient, protectDoctor, authorizeDoctor, authorizePatient, getInbox)


module.exports = router;