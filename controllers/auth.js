 const crypto = require('crypto');
 const ErrorResponse = require('../utils/errorResponse');
 const asyncHandler = require('../middleware/async');
 const sendEmail = require('../utils/sendEmail');
 const Patient = require('../models/Patient');
 const {
     response
 } = require('express');
 const jwt = require('jsonwebtoken');


 // @desc Register patient
 // @route POST /api/v1/auth/register
 // @access Public

 exports.register = asyncHandler(async (req, res, next) => {
     const {
         name,
         email,
         password,
         role,
         age,
         bloodGroup,
         isPreviouslyDiagnosed,
         address,
         gender,
         phoneNumber
     } = req.body;

     // Create Patient
     const patient = await Patient.create({
         name,
         email,
         password,
         role,
         age,
         bloodGroup,
         isPreviouslyDiagnosed,
         address,
         gender,
         phoneNumber
     });

     sendTokenResponse(patient, 200, res.redirect('/points'));

 });

 // @desc Logout patient
 // @route /auth/logout
 // @access Public

 exports.logout = asyncHandler(async (req, res, next) => {
     res.clearCookie('token').redirect('/');
 })

 // @desc Login patient
 // @route POST /api/v1/auth/login
 // @access Public

 exports.login = asyncHandler(async (req, res, next) => {
     const {
         email,
         password
     } = req.body;

     // Validate email and password
     if (!email || !password) {
         return next(new ErrorResponse('Please provide an email and password', 400));
     }

     // Check for patient
     const patient = await Patient.findOne({
         email
     }).select('+password');

     if (!patient) {
         return next(new ErrorResponse('Invalid credentials', 401));
     }

     // Check if password matches
     const isMatch = await patient.matchPassword(password);

     if (!isMatch) {
         return next(new ErrorResponse('Invalid credentials', 401));
     }

     //  res.redirect('/points');
     sendTokenResponse(patient, 200, res);
 });

 // @desc Reset password
 // @route PUT /auth/resetPassword/:resetToken
 // @access Public
 exports.resetPassword = asyncHandler(async (req, res, next) => {
     // Get hashed token
     const resetPasswordToken = crypto.createHash('sha256').update(req.params.resetToken).digest('hex');
     const patient = await Patient.findOne({
         resetPasswordToken,
         resetPasswordExpire: {
             $gt: Date.now()
         }
     });

     if (!patient) {
         return next(new ErrorResponse('Invalid token', 400))
     };

     // Set new password
     patient.password = req.body.password;
     patient.resetPasswordToken = undefined;
     patient.resetPasswordExpire = undefined;
     await patient.save();

     sendTokenResponse(patient, 200, res);
 });

 // GET USER INFO
 //  TESTING
 exports.getUserInfo = async (req, res) => {
     // Create token
     const token = req.headers.authentication;
     console.log(token)
     const decoded = jwt.verify(token, process.env.JWT_SECRET);
     const patient = await Patient.findById(decoded.id);
     res.json(patient);
 };

 // Get token from model, get cookie and send response
 const sendTokenResponse = (patient, statusCode, res) => {
     // Create token
     const token = patient.getSignedJwtToken();

     const options = {
         expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
         httpOnly: false
     };


     //  if (process.env.NODE_ENV === 'production') {
     //      options.secure = true;
     //  }

     res
         .status(statusCode)
         .cookie('token', token, options)
         .redirect('/home');
     //  .json({
     //      success: true,
     //      token
     //  }).;
     //  .render('home', {
     //      success: true,
     //      token
     //  });
     //  localStorage.setItem('token', JSON.stringify(token));
 }

 // @desc Get current logged in patient
 // @route GET /auth/me
 // @access Private

 exports.getMe = asyncHandler(async (req, res, next) => {
     const patient = await Patient.findById(req.patient.id);
     res.status(200).json({
         success: true,
         data: patient
     });
 });

 // @desc Update user details
 // @route PUT /auth/updateDetails
 // @access Private

 exports.updateDetails = asyncHandler(async (req, res, next) => {
     const fieldsToUpdate = {
         name: req.body.name,
         email: req.body.email,
         age: req.body.age,
         bloodGroup: req.body.bloodGroup,
         address: req.body.address,
         gender: req.body.gender,
         phoneNumber: req.body.phoneNumber
     }

     const patient = await Patient.findByIdAndUpdate(req.patient.id, fieldsToUpdate, {
         new: true,
         runValidators: true
     });

     res.status(200).json({
         success: true,
         data: patient
     }).redirect('/manageAccount');
 });

 // @desc Update password
 // @route PUT /api/v1/auth/updatePassword
 // @access Private

 exports.updatePassword = asyncHandler(async (req, res, next) => {
     const patient = await Patient.findById(req.patient.id).select('+password');

     // Check current password
     if (!(await patient.matchPassword(req.body.currentPassword))) {
         return next(new ErrorResponse('Password is incorrect', 401));
     }

     patient.password = req.body.newPassword;
     await patient.save();

     sendTokenResponse(patient, 200, res);
 });

 // @desc Forgot password
 // @route GET /api/v1/auth/forgotPassword
 // @access Public

 exports.forgotPassword = asyncHandler(async (req, res, next) => {
     const patient = await Patient.findOne({
         email: req.body.email
     });
     if (!patient) {
         return next(new ErrorResponse('There is no user with that email', 404));
     }

     // Get reset token
     const resetToken = patient.getResetPasswordToken();

     await patient.save({
         validateBeforeSave: false
     });

     // Create reset url
     const resetURL = `${req.protocol}://${req.get('host')}/auth/resetpassword/${resetToken}`;

     const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetURL}`;

     try {
         await sendEmail({
             email: patient.email,
             subject: 'Password reset email',
             message
         });

         res.status(200).json({
             success: true,
             data: 'Email sent'
         });
     } catch (err) {
         console.log(err);
         patient.resetPasswordToken = undefined;
         patient.resetPasswordExpire = undefined;

         await patient.save({
             validateBeforeSave: false
         });

         return next(new ErrorResponse('Email could not be sent', 500));
     }
 });