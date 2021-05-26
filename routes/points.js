const express = require("express");
const {
    getPoints,
    getPoint,
    createPoint,
    updatePoint,
    deletePoint,
    getPointsInRadius,
    pointPhotoUpload
} = require('../controllers/points');

const Point = require('../models/Point');
const advancedResults = require('../middleware/advancedResults');

// Include other resource routers
const plasmaRouter = require('./plasmas');
const reviewRouter = require('./reviews');

const router = express.Router();

const {
    protect,
    authorize
} = require('../middleware/auth');

// Re-route into other resouce routers
router.use('/:pointId/plasmas', plasmaRouter);
router.use('/:pointId/reviews', reviewRouter);

router.route('/radius/').get(getPointsInRadius);
router.route('/:id/photo').put(pointPhotoUpload);

router
    .route('/')
    .get(advancedResults(Point, 'plasma'), getPoints)
    .post(protect, authorize('admin'), createPoint);

router.route('/:id')
    .get(getPoint)
    .put(protect, authorize('admin'), updatePoint)
    .delete(protect, authorize('admin'), deletePoint);

module.exports = router;