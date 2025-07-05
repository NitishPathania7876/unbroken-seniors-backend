const { sequelize } = require('../db/db');
const { Op } = require("sequelize");
const ProviderOnboarding = require('../models/providerOnboardingModal')(sequelize);

exports.searchProviders = async (req, res) => {
  try {
    const { state, serviceType, category, priority } = req.query;

    if (!state || !serviceType) {
      return res.status(400).json({ message: "State and serviceType are required" });
    }

    const normalizedState = state.trim().toLowerCase();
    const normalizedServiceType = serviceType.trim().toLowerCase();
    const normalizedCategory = category?.trim().toLowerCase();
    const normalizedPriority = priority?.trim().toLowerCase();

    // Build Sequelize where clause
    const whereClause = {
      state: { [Op.like]: `%${normalizedState}%` },
    };

    if (normalizedCategory) {
      whereClause.category = { [Op.iLike]: `%${normalizedCategory}%` }; // PostgreSQL
    }

    if (normalizedPriority) {
      whereClause.priority = { [Op.iLike]: `%${normalizedPriority}%` };
    }

    const allProviders = await ProviderOnboarding.findAll({ where: whereClause });

    const filteredProviders = allProviders
      .map(provider => {
        let serviceTypes = [];

        if (Array.isArray(provider.serviceTypes)) {
          serviceTypes = provider.serviceTypes.flat();
        } else {
          console.error("Invalid serviceTypes format for provider ID", provider.userId, ":", provider.serviceTypes);
          return null;
        }

        const matchedService = serviceTypes.find(type =>
          String(type).trim().toLowerCase() === normalizedServiceType
        );

          if (matchedService) {
          const providerData = provider.toJSON(); // full object
          return {
            ...providerData,
            matchedServiceType: matchedService.name || matchedService,
            serviceUri: matchedService.uri || null,
          };
        }

        return null;
      })
      .filter(Boolean);

    if (filteredProviders.length === 0) {
      return res.status(404).json({ message: "No providers matched your criteria." });
    }

    return res.status(200).json(filteredProviders);
  } catch (error) {
    console.error("Search Error:", error);
    return res.status(500).json({ error: error.message });
  }
};
