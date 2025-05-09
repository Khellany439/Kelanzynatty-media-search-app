/**
 * Sequelize Model Configuration Module
 * 
 * Centralized model definition and database instance management with TypeScript support.
 * Initializes all application models and exports configured Sequelize instance with
 * proper typing for enhanced developer experience.
 * 
 * @module models/index
 * @author Kelanzy
 * @version 2.0.0
 * @license MIT
 */

import { Sequelize, Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import { User } from './user';
import { SearchHistory } from './searchHistory';

// Database interface with all models
interface Database {
  Sequelize: typeof Sequelize;
  sequelize: Sequelize;
  User: typeof User;
  SearchHistory: typeof SearchHistory;
  // Add other models here as you create them
}

// Initialize database object
const db: Database = {
  Sequelize,
  sequelize,
  User,
  SearchHistory
};

// Model relationships configuration
function setupRelationships(): void {
  // User to SearchHistory (One-to-Many)
  db.User.hasMany(db.SearchHistory, {
    foreignKey: 'userId',
    as: 'searchHistory'
  });

  db.SearchHistory.belongsTo(db.User, {
    foreignKey: 'userId',
    as: 'user'
  });

  // Add other relationships here
}

// Initialize all models
export function initializeModels(): void {
  // This would be called during application startup
  setupRelationships();

  if (process.env.NODE_ENV === 'development') {
    syncDatabase();
  }
}

// Database synchronization (development only)
async function syncDatabase(options = {}): Promise<void> {
  try {
    const syncOptions = {
      force: process.env.DB_SYNC_FORCE === 'true',
      alter: process.env.DB_SYNC_ALTER === 'true',
      ...options
    };

    if (process.env.NODE_ENV !== 'test') {
      logger.info(`Database sync options: ${JSON.stringify(syncOptions)}`);
    }

    await db.sequelize.sync(syncOptions);
    logger.info('Database synchronized successfully');
  } catch (error) {
    logger.error('Database synchronization failed', error);
    process.exit(1);
  }
}

// Export initialized database instance
export default db;

/**
 * Security Best Practices:
 * 1. Always use parameterized queries through Sequelize
 * 2. Implement field-level validation in model definitions
 * 3. Use model hooks for data sanitization
 * 
 * Performance Optimization:
 * 1. Add indexes for frequently queried fields
 * 2. Consider read replicas for scaling
 * 3. Use appropriate data types for storage efficiency
 * 
 * Development Tips:
 * 1. Use migrations for production schema changes
 * 2. Implement model factories for testing
 * 3. Enable logging in development environment
 * 
 * Production Recommendations:
 * 1. Disable automatic synchronization
 * 2. Implement connection pooling
 * 3. Monitor long-running queries
 */

/**
 * Example User Model Definition (models/user.ts):
 * 
 * import { Model, DataTypes } from 'sequelize';
 * import { sequelize } from '../config/database';
 * 
 * class User extends Model {
 *   public id!: number;
 *   public name!: string;
 *   public email!: string;
 *   public password!: string;
 * 
 *   public readonly createdAt!: Date;
 *   public readonly updatedAt!: Date;
 * }
 * 
 * User.init({
 *   id: {
 *     type: DataTypes.INTEGER,
 *     autoIncrement: true,
 *     primaryKey: true
 *   },
 *   name: {
 *     type: DataTypes.STRING(100),
 *     allowNull: false
 *   },
 *   email: {
 *     type: DataTypes.STRING(100),
 *     allowNull: false,
 *     unique: true,
 *     validate: {
 *       isEmail: true
 *     }
 *   },
 *   password: {
 *     type: DataTypes.STRING(255),
 *     allowNull: false
 *   }
 * }, {
 *   sequelize,
 *   modelName: 'user',
 *   tableName: 'users',
 *   timestamps: true,
 *   paranoid: true // Enable soft deletes
 * });
 * 
 * export { User };
 */