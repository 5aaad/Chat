const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Review = require('../models/Review');
const Point = require('../models/Point');

// @desc Get all reviews
// @route GET /points/:pointId/reviews
// @access Public
exports.getReviews = asyncHandler(async (req, res, next) => {
    if (req.params.pointId) {
        const reviews = await Review.find({
            point: req.params.pointId
        });

        return res.status(200).render('reviews', {
            success: true,
            count: reviews.length,
            data: reviews
        });
    }
});

// @desc      Get single review
// @route     GET /api/v1/reviews/:id
// @access    Public
exports.getReview = asyncHandler(async (req, res, next) => {
    const review = await Review.findById(req.params.id).populate({
        path: 'point',
        select: 'name description'
    });

    if (!review) {
        return next(
            new ErrorResponse(`No review found with the id of ${req.params.id}`, 404)
        );
    }

    res.status(200).json({
        success: true,
        data: review
    });
});

// @desc      Render Add review
// @route     GET /points/addreview/:pointId
// @access    Private
exports.getAddReview = asyncHandler(async (req, res, next) => {
    // req.body.point = req.params.pointId;
    const pointId = req.params.pointId;

    const point = await Point.findById(req.params.pointId);

    if (!point) {
        return next(new ErrorResponse(`No point with the id of ${req.params.pointId}`, 404));
    }

    res.render('addReview', {
        data: point
    });
});

// @desc      Add review
// @route     POST /points/addreview/:pointId
// @access    Private
exports.postAddReview = asyncHandler(async (req, res, next) => {
    req.body.point = req.params.pointId;

    const point = await Point.findById(req.params.pointId);

    if (!point) {
        return next(new ErrorResponse(`No point with the id of ${req.params.pointId}`, 404));
    }

    const review = await Review.create(req.body);

    res.status(200).json({
        success: true,
        data: review
    });
});

// @desc      Update review
// @route     PUT /api/v1/points/:pointId/reviews
// @access    Private
exports.updateReview = asyncHandler(async (req, res, next) => {
    let review = await Review.findById(req.params.id);

    if (!review) {
        return next(new ErrorResponse(`No point with the id of ${req.params.id}`, 404));
    }

    // Make sure review belongs to user or user is admin
    if (review.patient.toString() !== req.patient.id && req.patient.role !== 'admin') {
        return next(new ErrorResponse(`Not authorized to update review`, 401));
    }

    review = await Review.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: review
    });
});

// @desc      Delete review
// @route     DELETE /api/v1/points/:pointId/reviews
// @access    Private
exports.deleteReview = asyncHandler(async (req, res, next) => {
    const review = await Review.findById(req.params.id);

    if (!point) {
        return next(new ErrorResponse(`No point with the id of ${req.params.id}`, 404));
    }

    // Make sure review belongs to user or user is admin
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`Not authorized to update review`, 401));
    }

    await review.remove();

    res.status(200).json({
        success: true,
        data: {}
    });
});