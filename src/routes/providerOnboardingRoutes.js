const express = require('express');
const router = express.Router();
const {
  createProvider,
  getProviderById  , 
  getAllProviders
} = require('./../controllers/providerOnboardingController');
const upload = require('../middlewares/multer')
// const authMiddleware = require('../middlewares/authMiddleware');
router.post('/create',  upload.fields([
    { name: 'serviceImage', maxCount: 50 },
    { name: 'galleryImages', maxCount: 50 },
    { name: 'certFiles', maxCount: 50 }, // if you upload cert files
  ]), createProvider);
router.get("/get/:id",getProviderById)

router.get("/get",getAllProviders)

module.exports = router; 
