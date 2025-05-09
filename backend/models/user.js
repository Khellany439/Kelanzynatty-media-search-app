/**
 * User Model Definition
 * 
 * Defines the User model with TypeScript support, including:
 * - Strong typing for model attributes and instances
 * - Comprehensive field validation
 * - Security best practices
 * - Relationship definitions
 * 
 * @module models/User
 * @version 2.0.0
 */

import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import bcrypt from 'bcrypt';

// Interface for User attributes
interface UserAttributes {
  id: number;
  name: string;
  email: string;
  password: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Interface for User creation attributes (optional fields)
interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public name!: string;
  public email!: string;
  public password!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Instance methods
  public async comparePassword(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
  }

  // Associations will be added here by Sequelize
  public readonly searchHistory?: any[]; // Replace with actual model type
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      validate: {
        isInt: true
      }
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Name cannot be empty'
        },
        len: {
          args: [2, 100],
          msg: 'Name must be between 2 and 100 characters'
        }
      }
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: {
        name: 'users_email_unique',
        msg: 'Email address already in use'
      },
      validate: {
        isEmail: {
          msg: 'Please provide a valid email address'
        },
        notEmpty: {
          msg: 'Email cannot be empty'
        }
      }
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Password cannot be empty'
        },
        len: {
          args: [8, 255],
          msg: 'Password must be at least 8 characters'
        }
      }
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'created_at' // Maps to created_at column
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'updated_at' // Maps to updated_at column
    }
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true, // Enable automatic timestamps
    paranoid: true, // Enable soft deletes
    hooks: {
      beforeCreate: async (user: User) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user: User) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      }
    },
    defaultScope: {
      attributes: {
        exclude: ['password'] // Exclude password by default
      }
    },
    scopes: {
      withPassword: {
        attributes: {
          include: ['password'] // Include password when needed
        }
      }
    }
  }
);

// Add any class-level methods
User.findByEmail = async function(email: string): Promise<User | null> {
  return this.findOne({ 
    where: { email },
    include: [] // Add any associations if needed
  });
};

export { User, UserAttributes };