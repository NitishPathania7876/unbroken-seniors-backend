const express = require('express');
const router = express.Router();
const {
  createProvider,
  getProviderById  , 
  getAllProviders
} = require('./../controllers/providerOnboardingController');

// const authMiddleware = require('../middlewares/authMiddleware');
router.post('/create', createProvider);
router.get("/get/:id",getProviderById)

router.get("/get",getAllProviders)

module.exports = router; 
