const { sequelize } = require("../db/db");
const LeadRequest  = require('../models/leadInqueryModal')(sequelize);

const submitLead = async (req, res) => {
  try {
    const {
      fullName,
      mobileNumber,
      email,
      city,
      requiredService,
      preferredStartDate,
      message,
    } = req.body;

    const newLead = await LeadRequest.create({
      fullName,
      mobileNumber,
      email,
      city,
      requiredService,
      preferredStartDate,
      message,
    });

    res.status(201).json({
      message: 'Lead submitted successfully',
      data: newLead,
    });A
  } catch (error) {
    console.error('Error submitting lead:', error);
    res.status(500).json({ error: 'Failed to submit lead', details: error.message });
  }
};

module.exports = { submitLead };
