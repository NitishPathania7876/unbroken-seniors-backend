const express = require('express');
const router = express.Router();
const {
  createProvider,
  getProviderById
} = require('./../controllers/providerOnboardingController');
// const authMiddleware = require('../middlewares/authMiddleware');
router.post('/create', createProvider);
router.get("/get/:id",getProviderById)
module.exports = router; 
