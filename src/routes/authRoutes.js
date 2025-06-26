const express = require('express');
const { LoginWithEmailOTP ,verifyEmailOTP, login} = require('../controllers/authController');
const router = express.Router();

router.post('/LoginWithEmailOTP', LoginWithEmailOTP);
router.post('/verifyEmailOTP', verifyEmailOTP);
router.post("/login",login)

module.exports = router;

