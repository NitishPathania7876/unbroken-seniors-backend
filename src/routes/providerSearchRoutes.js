const express = require('express');
const { searchProviders } = require('../controllers/providerSearchController');
const router = express.Router();
router.get('/search',searchProviders);
module.exports = router; 