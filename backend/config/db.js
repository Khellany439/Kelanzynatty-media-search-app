/**
 * Database Connection Module
 * 
 * Configures and manages PostgreSQL database connections using Sequelize ORM.
 * Provides database instance and connection testing functionality with enhanced
 * TypeScript support and production-ready configurations.
 * 
 * @module database
 * @author Kelanzy
 * @version 2.0.0
 * @license MIT
 */

import { Sequelize, Dialect, Options } from 'sequelize';
import dotenv from 'dotenv';
import { logger } from '../utils/logger'; // Assuming you have a logger utility

dotenv.config();

// Type definitions for database configuration
interface DatabaseConfig {
  name: string;
  user: string;
  password: string;
  host: string;
  port: number;
  dialect: Dialect;
  logging: Options['logging'];
  pool: {
    max: number;
    min: number;
    acquire: number;
    idle: number;
  };
  dialectOptions?: {
    ssl?: {
      require: boolean;
      rejectUnauthorized: boolean;
    };
  };
}

// Environment variables validation
const requiredEnvVars = ['DB_NAME', 'DB_USER', 'DB_PASSWORD'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

const isProduction = process.env.NODE_ENV === 'production';
const isTest = process.env.NODE_ENV === 'test';

/**
 * Database configuration object
 * @type {DatabaseConfig}
 */
const dbConfig: DatabaseConfig = {
  name: process.env.DB_NAME as string,
  user: process.env.DB_USER as string,
  password: process.env.DB_PASSWORD as string,
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  dialect: 'postgres',
  logging: process.env.DB_LOGGING === 'true' ? console.log : false,
  pool: {
    max: parseInt(process.env.DB_POOL_MAX || '5'),
    min: parseInt(process.env.DB_POOL_MIN || '0'),
    acquire: parseInt(process.env.DB_POOL_ACQUIRE || '30000'),
    idle: parseInt(process.env.DB_POOL_IDLE || '10000')
  },
  ...(isProduction && {
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  })
};

if (isTest) {
  dbConfig.name = process.env.TEST_DB_NAME as string;
}

/**
 * Sequelize database instance
 * @type {Sequelize}
 */
const sequelize = new Sequelize(
  dbConfig.name,
  dbConfig.user,
  dbConfig.password,
  dbConfig
);

/**
 * Tests the database connection and synchronizes models if needed
 * @async
 * @function initializeDatabase
 * @returns {Promise<void>}
 * @throws {Error} When connection fails
 */
export const initializeDatabase = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    logger.info('✅ PostgreSQL connection established successfully');

    if (process.env.DB_SYNC === 'true') {
      await sequelize.sync({ alter: process.env.DB_ALTER === 'true' });
      logger.info('Database models synchronized');
    }
  } catch (error) {
    logger.error('❌ Database connection failed', error as Error);
    process.exit(1);
  }
};

/**
 * Gracefully closes the database connection
 * @async
 * @function closeDatabase
 * @returns {Promise<void>}
 */
export const closeDatabase = async (): Promise<void> => {
  try {
    await sequelize.close();
    logger.info('Database connection closed');
  } catch (error) {
    logger.error('Error closing database connection', error as Error);
  }
};

// Handle application termination
process.on('SIGTERM', closeDatabase);
process.on('SIGINT', closeDatabase);

export { sequelize, initializeDatabase, closeDatabase };

/**
 * Security Best Practices:
 * 1. Use environment variables for all sensitive credentials
 * 2. Implement connection pooling with appropriate limits
 * 3. Enable SSL in production environments
 * 4. Regularly rotate database credentials
 * 5. Implement proper logging without exposing sensitive data
 * 
 * Production Recommendations:
 * 1. Set DB_POOL_MAX based on your database capacity
 * 2. Monitor connection pool usage
 * 3. Implement retry logic for transient failures
 * 4. Use read replicas for scaling
 * 
 * Development Tips:
 * 1. Set DB_LOGGING=true for query debugging
 * 2. Use DB_SYNC=true for automatic schema updates (not for production)
 * 3. Implement migrations for schema changes
 */