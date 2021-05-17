const path = require('path');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const geocoder = require('../utils/geocoder');
const Point = require('../models/Point');
const advancedResults = require('../middleware/advancedResults');

// @desc Get all points
// @route GET /points
// @access Public

exports.getPoints = asyncHandler(async function (req, res, next) {
    res.status(200).json(res.advancedResults);
});

// @desc Get single point
// @route GET /point/:id
// @access Public

exports.getPoint = asyncHandler(async function (req, res, next) {
    const point = await Point.findById(req.params.id);
    if (!point) {
        return next(new ErrorResponse(`Point not found with id of ${req.params.id}`, 404));
    }
    res.status(200).json({
        success: true,
        data: point
    });
});

// @desc Create new point
// @route POST /points
// @access Private

exports.createPoint = asyncHandler(async function (req, res, next) {
    // Add patient to req.body
    req.body.patient = req.patient.id;

    // Check for published point
    const locatedPoint = await Point.findOne({
        patient: req.patient.id
    });

    const point = await Point.create(req.body);
    res.status(200).json({
        success: true,
        data: point
    });

});

// @desc Update all points
// @route PUT /points/:id
// @access Public

exports.updatePoint = asyncHandler(async function (req, res, next) {
    let point = await Point.findById(req.params.id);

    if (!point) {
        return next(new ErrorResponse(`Point not found with id of ${req.params.id}`, 404));
    }

    // Make sure user is donation point owner
    if (point.patient.toString() !== req.patient.id && req.patient.role !== 'admin') {
        return next(new ErrorResponse(`${req.params.id} is not authorized to update this donation point.`, 401))
    }

    point = await Point.findOneAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })

    res.status(200).json({
        success: true,
        data: point
    });
});

// @desc Delete point
// @route DELETE /api/v1/points/:id
// @access Private

exports.deletePoint = asyncHandler(async function (req, res, next) {
    const point = await Point.findById(req.params.id);

    if (!point) {
        return next(new ErrorResponse(`Point not found with id of ${req.params.id}`, 404));
    }

    // Make sure user is donation point owner
    if (point.patient.toString() !== req.patient.id && req.patient.role !== 'admin') {
        return next(new ErrorResponse(`${req.params.id} is not authorized to delete this donation point.`, 401))
    }

    point.remove();

    res.status(200).json({
        success: true,
        data: {}
    });
});

// @desc Get points within a radius
// @route GET /points/radius/:zipcode/:distance
// @access Private

exports.getPointsInRadius = asyncHandler(async function (req, res, next) {
    const {
        zipcode,
        distance
    } = req.params;

    // Get lat/long from geocoder
    const loc = await geocoder.geocode(zipcode);
    const lat = loc[0].latitude;
    const lng = loc[0].longitude;

    // Calc radius using radians
    // Divide dist by radius of Earth
    // Earth Radius = 3963 miles / 6378 kilometers
    const radius = distance / 3963;

    const points = await Point.find({
        location: {
            $geowithin: {
                $centerSphere: [
                    [lng, lat], 3963
                ]
            }
        }
    });

    res.status(200).json({
        success: true,
        count: points.length,
        data: points
    })
});