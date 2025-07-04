const { sequelize } = require('../db/db');
const ProviderOnboarding = require('../models/providerOnboardingModal')(sequelize)
exports.searchProviders = async (req, res) => {
  try {
    const { state, pincode, serviceType } = req.query;

    if (!state || !pincode || !serviceType) {
      return res.status(400).json({ message: "State, pincode, and serviceType are required" });
    }

    // Fetch providers by state only first
    const allProviders = await ProviderOnboarding.findAll({
      where: { state }
    });

    // Filter providers based on pincode inside serviceAreas & serviceType
    const filtered = allProviders.filter(provider => {
    const serviceAreas = Array.isArray(provider.serviceAreas)
  ? provider.serviceAreas
  : JSON.parse(provider.serviceAreas || '[]');

const services = Array.isArray(provider.serviceTypes)
  ? provider.serviceTypes
  : JSON.parse(provider.serviceTypes || '[]');

      const pincodeMatch = serviceAreas.some(area => area.pincode === pincode);
      const serviceMatch = services.includes(serviceType);
 console.log(serviceMatch)
      return pincodeMatch && serviceMatch;
    });

    res.status(200).json(filtered);
  } catch (error) {
    console.error("Search Error:", error);
    res.status(500).json({ error: error.message });
  }
};