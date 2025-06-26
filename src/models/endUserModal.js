const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');
module.exports = (sequelize) => {
  const EndUser = sequelize.define('EndUser', {
    userId: {
      type: DataTypes.STRING(50),
      primaryKey: true, 
      unique: true,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
  firstName: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        notEmpty: true,
      },
    },
     lastName: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        notEmpty: true,
      },
    },
    email: {
      type: DataTypes.STRING(100),
      unique: true,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        notEmpty: true,
      },
    },
  }, {
    indexes: [
      { fields: ['email'] },
    ],
    timestamps: true,
    tableName: 'EndUsers',
  });

  EndUser.beforeCreate(async (user) => {
    if (user.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
    }
  });

  EndUser.beforeUpdate(async (user) => {
    if (user.changed('password')) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
    }
  });

  EndUser.prototype.validatePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
  };

  return EndUser;
};