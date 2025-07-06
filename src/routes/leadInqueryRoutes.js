const express = require('express');
const router = express.Router();
const { submitLead } = require('../controllers/leadInquery');

router.post('/submit-lead', submitLead);

module.exports = router;
