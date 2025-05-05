const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db'); // Destructure the export
const bcrypt = require('bcrypt');

// User model definition
class User extends Model {}

User.init(
  {
    // Define the attributes for the user model
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true, // Ensure email is unique
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize, // pass the sequelize instance
    modelName: 'User', // Specify the model name
    tableName: 'users', // Specify the table name
    timestamps: false, // Disable Sequelize's automatic timestamp management
    hooks: {
      beforeSave: async (user) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      }
    }
  }
);

// Add a method to hash the password
User.prototype.hashPassword = async function(password) {
  return await bcrypt.hash(password, 10);
};

// Add a method to verify the password
User.prototype.verifyPassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = User;
