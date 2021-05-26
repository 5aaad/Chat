const express = require("express");
const {
    getPlasmas,
    getPlasma,
    addPlasma
} = require('../controllers/plasmas');

const Plasma = require('../models/Plasma');
const advancedResults = require('../middleware/advancedResults');
const {
    protect,
    authorize
} = require('../middleware/auth');

const router = express.Router({
    mergeParams: true
});

router
    .route('/')
    .get(advancedResults(Plasma, {
            path: 'point',
            select: 'name description'
        }),
        getPlasmas)
    .post(addPlasma);

router
    .route('/:id')
    .get(getPlasma);
// .put(protect, updatePlasma)
// .delete(protect, deletePlasma);

module.exports = router;