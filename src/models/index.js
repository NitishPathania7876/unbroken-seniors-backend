const { sequelize } = require('../db/db');

const EndUser = require('./endUserModal')(sequelize);
const ProviderOnboarding = require('../models/providerOnboardingModal')(sequelize);
// 1:Many relationship
EndUser.hasMany(ProviderOnboarding, {
  foreignKey: 'userId',
  sourceKey: 'userId'
});
ProviderOnboarding.belongsTo(EndUser, {
  foreignKey: 'userId',
  targetKey: 'userId'
});
// Sync tables
async function syncDatabase() {
  try {
    await sequelize.sync({ force: false }); // Set force to true to reset tables
    console.log('Database and tables synced');
  } catch (error) {
    console.error('Error syncing database:', error);
  }
}

syncDatabase();

module.exports = {
  sequelize,
  EndUser,
  ProviderOnboarding
};




