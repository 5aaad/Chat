const express = require('express');
const {
    getReviews,
    getReview,
    addReview,
    updateReview,
    deleteReview
} = require('../controllers/reviews');

const Review = require('../models/Review');

const router = express.Router({
    mergeParams: true
});

const advancedResults = require('../middleware/advancedResults');
const {
    protect,
    authorize
} = require('../middleware/auth');

router
    .route('/')
    .get(advancedResults(Review, {
            path: 'point',
            select: 'name description'
        }),
        getReviews
    ).post(protect, authorize('patient', 'admin'), addReview);

router
    .route('/:id')
    .get(getReview)
    .put(protect, authorize('patient', 'admin'), updateReview)
    .delete(protect, authorize('patient', 'admin'), deleteReview);

module.exports = router;