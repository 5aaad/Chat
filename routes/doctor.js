const express = require('express');
const {
	register,
	login,
	getMe,
	forgotPassword,
	resetPassword,
	updateDetails,
	updatePassword,
	getUserInfo,
	logout,
	chat,
	patient
} = require('../controllers/doctor');

const router = express.Router();
const {
	protectDoctor
} = require('../middleware/doctorAuth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protectDoctor, getMe);
router.put('/updateDetails', updateDetails);
router.put('/updatePassword', updatePassword);
router.post('/forgotPassword', forgotPassword);
router.put('/resetPassword/:resetToken', resetPassword);
router.get('/getInfo', getUserInfo);
router.get('/logout', logout);
router.get('/info', chat);
router.get('/get-patients', patient);


module.exports = router;