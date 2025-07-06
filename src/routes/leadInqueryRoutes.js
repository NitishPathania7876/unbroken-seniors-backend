const express = require('express');
const router = express.Router();
const { submitLead , getLeadsByUserId } = require('../controllers/leadInquery');

router.post('/submit-lead', submitLead);
router.get('/get-lead/:userId', getLeadsByUserId);

module.exports = router;
