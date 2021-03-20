const express = require("express");
const router = express.Router();
const {
    getStores,
    addStore
} = require("../controllers/stores");

router
    .route('/stores')
    .get(getStores)
    .post(addStore);

module.exports = router;