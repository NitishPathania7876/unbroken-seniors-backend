const { sequelize } = require('../db/db');
const EndUser = require('./endUserModal')(sequelize);
// Define relationships
// EndUser.hasMany(BusinessDetails, { foreignKey: 'userId', targetKey: 'userId' });
// BusinessDetails.belongsTo(EndUser, { foreignKey: 'userId', targetKey: 'userId' });
// Sync tables in order to respect foreign key dependencies
async function syncDatabase() {
  try {
    await EndUser.sync({ force: false }); 
    console.log('Database and tables synced');
  } catch (error) {
    console.error('Error syncing database:', error);
  }
}
syncDatabase();
module.exports = {
  sequelize,
  EndUser
};












