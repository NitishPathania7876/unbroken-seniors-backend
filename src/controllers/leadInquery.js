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
      userId
    } = req.body;
console.log("userid"  , userId)
    const newLead = await LeadRequest.create({
      fullName,
      mobileNumber,
      email,
      city,
      requiredService,
      preferredStartDate,
      message,
      userId
      
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
const getLeadsByUserId = async (req, res) => {
  try {
    const { userId } = req.params; // or use req.query.userId if sent via query

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const leads = await LeadRequest.findAll({
      where: { userId }
    });

    if (leads.length === 0) {
      return res.status(404).json({ message: "No leads found for this user" });
    }

    res.status(200).json({ message: "Leads fetched successfully", data: leads });
  } catch (error) {
    console.error("Error fetching leads:", error);
    res.status(500).json({ error: "Failed to fetch leads", details: error.message });
  }
};

module.exports = { submitLead  , getLeadsByUserId};
