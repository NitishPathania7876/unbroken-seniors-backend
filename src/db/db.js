const { Sequelize } = require('sequelize');
require('dotenv').config();
// Initialize Sequelize with MySQL connectionjkjk
// jyui
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER, 
  process.env.DB_PASSWORD, 
  {
    host: process.env.DB_HOST, 
    dialect: 'mysql', 
    logging: false, 
    pool: {
      max: 5,
      min: 0, 
      acquire: 30000, 
      idle: 10000, 
    },
  }
);

// Test the database connection
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('MySQL database connected successfully');
  } catch (error) {
    console.error('Unable to connect to MySQL database:', error);
    process.exit(1); // Exit process on connection failure
  }
};

// Export sequelize instance and connect function
module.exports = { sequelize, connectDB };