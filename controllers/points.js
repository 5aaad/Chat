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
    res.status(200).render('points', res.advancedResults);
});

// @desc Get single point
// @route GET /point/:id
// @access Public

exports.getPoint = asyncHandler(async function (req, res, next) {
    const point = await Point.findById(req.params.id);
    if (!point) {
        return next(new ErrorResponse(`Point not found with id of ${req.params.id}`, 404));
    }
    res.status(200).render('point', {
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
// @route DELETE /points/:id
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
    console.log(req.query, "eeeeee")
    const {
        zipcode,
        distance
    } = req.query;
    console.log(req, "yes")
    // Get lat/long from geocoder
    const loc = await geocoder.geocode(zipcode);
    const lat = loc[0].latitude;
    const lng = loc[0].longitude;

    // Calc radius using radians
    // Divide dist by radius of Earth
    // Earth Radius = 6378 kilometers
    const radius = distance / 3963;
    const points = await Point.find({
        location: {
            $geoWithin: {
                $centerSphere: [
                    [lng, lat], radius
                ]
            }
        }
    });

    res.render('nearestPoint', {
        success: true,
        count: points.length,
        data: points
    });
});

// @desc Upload photo for point
// @route PUT /api/v1/points/:id/photo
// @access Private

exports.pointPhotoUpload = asyncHandler(async function (req, res, next) {
    const point = await Point.findById(req.params.id);

    if (!point) {
        return next(new ErrorResponse(`Point not found with id of ${req.params.id}`, 404));
    }

    if (!req.files) {
        return next(new ErrorResponse(`Please upload a file`, 400));
    }

    const file = req.files.file;

    // Make sure that the image is a photo
    if (!file.mimetype.startsWith('image')) {
        return next(new ErrorResponse(`Please upload an image file`, 400));
    }

    // Check filesize
    if (file.size > process.env.MAX_FILE_UPLOAD) {
        return next(new ErrorResponse(`Please upload an image file less than ${process.env.MAX_FILE_UPLOAD}`, 400));
    }

    // Create custom filename
    file.name = `photo_${point.name}${path.parse(file.name).ext}`;

    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
        if (err) {
            console.log(err);
            return next(new ErrorResponse(`Problem with file upload`, 500));
        }

        await Point.findByIdAndUpdate(req.params.id, {
            photo: file.name
        });

        res.status(200).json({
            success: true,
            data: file.name
        })
    });

    console.log(file.name);


});