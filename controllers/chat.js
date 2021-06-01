const asyncHandler = require('../middleware/async');
const Chat = require('../models/Chat');
const Doctor = require('../models/Doctor');

// @desc Logout patient
// @route /auth/logout
// @access Public

exports.getInbox = asyncHandler(async (req, res, next) => {
    const doctors = await Doctor.find();

    res.status(200).render('inbox', {
        success: true,
        data: doctors
    });
});

// @desc Logout patient
// @route /auth/logout
// @access Public

exports.getChat = asyncHandler(async (req, res, next) => {
    res.render('chat');
});