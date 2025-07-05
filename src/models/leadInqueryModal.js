const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const LeadRequest = sequelize.define('LeadRequest', {
    fullName: DataTypes.STRING,
    mobileNumber: DataTypes.STRING,
    email: DataTypes.STRING,
    city: DataTypes.STRING,
    requiredService: DataTypes.STRING,
    preferredStartDate: DataTypes.DATEONLY,
    message: DataTypes.TEXT
  });

  return LeadRequest;
};
