const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db'); // Destructure the export

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
  }
);

module.exports = User;
