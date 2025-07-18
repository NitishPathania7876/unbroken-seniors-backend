const { sequelize } = require('../db/db');
const ProviderOnboarding = require('../models/providerOnboardingModal')(sequelize)
//  Add new onboarding
exports.createProvider = async (req, res) => {
  try {
    const {
      businessName,
      businessAddress,
      phoneNumber,
      description,
      serviceAreas,
      selectedService,
      serviceTypes,
      certifications,
      userId,
      state,
    } = req.body;
console.log('req.files:', req.files);
    // ✅ Handle files
    const serviceImageFiles = req.files?.serviceImage || [];
    const galleryImageFiles = req.files?.galleryImages || [];
    const certFiles = req.files?.certFiles || [];

    const serviceImage = serviceImageFiles.map(file => file.filename);
    const galleryImages = galleryImageFiles.map(file => file.filename);

    // ✅ Parse certs and match files
    const parsedCerts = JSON.parse(certifications || "[]");
    const finalCerts = parsedCerts.map((cert, i) => ({
      name: cert.name,
      file: certFiles[i]?.filename || "",
    }));

    const newProvider = await ProviderOnboarding.create({
      businessName,
      businessAddress,
      phoneNumber,
      description,
      serviceImage,
      galleryImages,
      serviceAreas: JSON.parse(serviceAreas),
      serviceTypes: JSON.parse(serviceTypes),
      selectedService,
      certifications: finalCerts,
      userId,
      state,
    });

    res.status(201).json({ message: "Provider onboarding created", data: newProvider });
  } catch (error) {
    console.error("Error creating provider:", error);
    res.status(500).json({ error: error.message });
  }
};
// Get all onboardings
exports.getAllProviders = async (req, res) => {
  try {
    const providers = await ProviderOnboarding.findAll();
    res.status(200).json(providers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// Get by ID
exports.getProviderById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = id
    const provider = await ProviderOnboarding.findAll({ where: { userId } });
    if (!provider) return res.status(404).json({ message: 'Provider not found' });
    res.status(200).json(provider);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//Update by ID
exports.updateProvider = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await ProviderOnboarding.update(req.body, {
      where: { id }
    });
    if (updated[0] === 0) return res.status(404).json({ message: 'Provider not found or no changes' });
    res.status(200).json({ message: 'Provider updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete by ID
exports.deleteProvider = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await ProviderOnboarding.destroy({ where: { id } });
    if (!deleted) return res.status(404).json({ message: 'Provider not found' });
    res.status(200).json({ message: 'Provider deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

