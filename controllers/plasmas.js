const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Plasma = require('../models/Plasma');
const Point = require('../models/Point');

// @desc    Get plasmas
// @route   GET /api/v1/plasmas
// @route   GET /api/v1/points/:pointId/plasmas
// @access  Public
exports.getPlasmas = asyncHandler(async function (req, res, next) {
    if (req.params.pointId) {
        const plasmas = await Plasma.find({
            point: req.params.pointId
        });

        return res.status(200).json({
            success: true,
            count: plasmas.length,
            data: plasmas
        });
    } else {
        res.status(200).json(res.advancedResults);
    }
});

// @desc    Get single plasma
// @route   GET /api/v1/plasmas/:id
// @access  Public
exports.getPlasma = asyncHandler(async function (req, res, next) {
    const plasma = await Plasma.findById(req.params.id).populate({
        path: 'plasma',
        select: 'name description'
    });

    if (!plasma) {
        return next(new ErrorResponse(`No plasma with the id of ${req.params.id}`), 404);
    }
    res.status(200).json({
        success: true,
        data: plasma
    });
});

// @desc    Add plasma
// @route   POST /api/v1/points/:pointId/plasmas
// @access  Private
exports.addPlasma = asyncHandler(async function (req, res, next) {
    req.body.point = req.params.pointId;
    req.body.patient = req.patient.id;

    const point = await Point.findById(req.params.pointId);

    if (!point) {
        return next(new ErrorResponse(`No donation point with the id of ${req.params.pointId}`), 404);
    }

    // Make sure logged in user is donation point owner
    if (point.patient.toString() !== req.patient.id && req.patient.role !== 'admin') {
        return next(new ErrorResponse(`${req.patient.id} is not authorized to add plasma to donation point ${point._id}`))
    }

    const plasma = await Plasma.create(req.body);

    res.status(200).json({
        success: true,
        data: plasma
    });
});