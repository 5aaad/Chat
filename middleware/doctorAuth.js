const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const ErrorResponse = require('../utils/errorResponse');
const Doctor = require('../models/Doctor');

// Protect routes
exports.protectDoctor = asyncHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    // else if(req.cookies.token) {
    //     token = req.cookies.token
    // }

    // Make sure token exists
    if (!token) {
        return next(new ErrorResponse('Not authorized to access this route', 401));
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.doctor = await Doctor.findById(decoded.id);

        next();
    } catch (err) {
        return next(new ErrorResponse('Not authorized to access this route', 401));
    }
});

// Grant access to specific roles
exports.authorizeDoctor = function (...doctor) {
    return (req, res, next) => {
        if (!doctor) {
            return next(new ErrorResponse(`${req.doctor} is not authorized to access this route`, 403));
        }
        next();
    }
}