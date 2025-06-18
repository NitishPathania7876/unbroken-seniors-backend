const express = require('express');
const { LoginWithEmailOTP ,verifyEmailOTP} = require('../controllers/authController');
const router = express.Router();

router.post('/LoginWithEmailOTP', LoginWithEmailOTP);
router.post('/verifyEmailOTP', verifyEmailOTP);


module.exports = router;

