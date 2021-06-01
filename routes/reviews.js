const express = require('express');
const {
    getReviews,
    getReview,
    updateReview,
    deleteReview,
    getAddReview,
    postAddReview
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
    )

router
    .route('/:id')
    .get(getReview)
    .put(updateReview)
    .delete(deleteReview);

router.route('/addreview/:pointId')
    .get(getAddReview)
    .post(postAddReview);

module.exports = router;