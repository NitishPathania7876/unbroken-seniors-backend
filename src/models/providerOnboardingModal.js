const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ProviderOnboarding = sequelize.define('ProviderOnboarding', {
    userId: {
      type: DataTypes.STRING(50),
      primaryKey: true,
      unique: true,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    businessName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    businessAddress: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    serviceImage: {
      type: DataTypes.TEXT,
      allowNull: true,
      get() {
        const rawValue = this.getDataValue("serviceImage");
        return rawValue ? JSON.parse(rawValue) : [];
      },
      set(value) {
        this.setDataValue("serviceImage", JSON.stringify(value));
      },
    },

    serviceAreas: {
      type: DataTypes.TEXT,
      get() {
        const rawValue = this.getDataValue('serviceAreas');
        return rawValue ? JSON.parse(rawValue) : [];
      },
      set(value) {
        this.setDataValue('serviceAreas', JSON.stringify(value));
      },
    },
    selectedService: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    serviceTypes: {
      type: DataTypes.TEXT,
      get() {
        const rawValue = this.getDataValue('serviceTypes');
        return rawValue ? JSON.parse(rawValue) : [];
      },
      set(value) {
        this.setDataValue('serviceTypes', JSON.stringify(value));
      },
    },
    certifications: {
      type: DataTypes.TEXT,
      get() {
        const rawValue = this.getDataValue('certifications');
        return rawValue ? JSON.parse(rawValue) : [];
      },
      set(value) {
        this.setDataValue('certifications', JSON.stringify(value));
      },
    },
    galleryImages: {
      type: DataTypes.TEXT,
      get() {
        const rawValue = this.getDataValue('galleryImages');
        return rawValue ? JSON.parse(rawValue) : [];
      },
      set(value) {
        this.setDataValue('galleryImages', JSON.stringify(value));
      },
    },
    applicationStatus: {
      type: DataTypes.STRING,
      defaultValue: 'pending',
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'provider_onboardings',
    timestamps: false,
  });

  return ProviderOnboarding;
};
