const { DataTypes } = require('sequelize');
module.exports = (sequelize) => {
  const ProviderOnboarding = sequelize.define('ProviderOnboarding', {
    businessName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    businessAddress: {
      type: DataTypes.STRING,
      allowNull: false
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false
    },
    serviceAreas: {
      type: DataTypes.TEXT,
      get() {
        const rawValue = this.getDataValue('serviceAreas');
        return rawValue ? JSON.parse(rawValue) : [];
      },
      set(value) {
        this.setDataValue('serviceAreas', JSON.stringify(value));
      }
    },
    serviceTypes: {
      type: DataTypes.TEXT,
      get() {
        const rawValue = this.getDataValue('serviceTypes');
        return rawValue ? JSON.parse(rawValue) : [];
      },
      set(value) {
        this.setDataValue('serviceTypes', JSON.stringify(value));
      }
    },
    certifications: {
      type: DataTypes.TEXT,
      get() {
        const rawValue = this.getDataValue('certifications');
        return rawValue ? JSON.parse(rawValue) : [];
      },
      set(value) {
        this.setDataValue('certifications', JSON.stringify(value));
      }
    },
    galleryImages: {
      type: DataTypes.TEXT,
      get() {
        const rawValue = this.getDataValue('galleryImages');
        return rawValue ? JSON.parse(rawValue) : [];
      },
      set(value) {
        this.setDataValue('galleryImages', JSON.stringify(value));
      }
    },
    applicationStatus: {
      type: DataTypes.STRING,
      defaultValue: 'pending'
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'provider_onboardings',
    timestamps: false
  });

  return ProviderOnboarding;
};
