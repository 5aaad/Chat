const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Patient = require('../models/Patient');

// @desc Get all patient
// @route GET /api/v1/auth/patients
// @access Private/Admin

exports.getPatients = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedResults);
});

// @desc Get single patients
// @route GET /api/v1/auth/patients/:id
// @access Private/Admin

exports.getPatient = asyncHandler(async (req, res, next) => {
    const patient = await Patient.findById(req.params.id);

    res.status(200).json({
        success: true,
        data: patient
    })
});

// @desc Create patient
// @route POST /api/v1/auth/patients
// @access Private/Admin

exports.createPatient = asyncHandler(async (req, res, next) => {
    const patient = await Patient.create(req.body);

    res.status(201).json({
        success: true,
        data: patient
    })
});

// @desc Update patient
// @route PUT /api/v1/auth/patients/:id
// @access Private/Admin

exports.updatePatient = asyncHandler(async (req, res, next) => {
    const patient = await Patient.create(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: patient
    })
});

// @desc Delete patient
// @route DELETE /api/v1/auth/patients
// @access Private/Admin

exports.deletePatient = asyncHandler(async (req, res, next) => {
    await Patient.findByIdAndDelete(req.params.id);

    res.status(200).json({
        success: true,
        data: {}
    })
});