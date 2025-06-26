const express = require('express');
const router = express.Router();
const {
  createProvider
} = require('./../controllers/providerOnboardingController');
// const authMiddleware = require('../middlewares/authMiddleware');
router.post('/create', createProvider);
module.exports = router; 
