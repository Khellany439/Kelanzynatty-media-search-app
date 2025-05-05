/**
 * MAIN SERVER CONFIGURATION MODULE
 * SETS UP EXPRESS SERVER WITH CORE CONFIGURATION, MIDDLEWARE, ROUTES,
 * AND ERROR HANDLING. INTEGRATES WITH DATABASE AND ENVIRONMENT VARIABLES.
 * 
 * KEY COMPONENTS:
 * - CORS CONFIGURATION WITH CREDENTIALS SUPPORT
 * - COOKIE PARSING FOR AUTHENTICATION TOKENS
 * - MODULAR ROUTE MANAGEMENT
 * - CENTRALIZED ERROR HANDLING
 * - DATABASE CONNECTION MANAGEMENT
 * 
 * AUTHOR: KELANZY
 * DATE: 2023-10-23
 * VERSION: 1.0.0
 * REQUIREMENTS:
 * - NODE.JS ENVIRONMENT
 * - POSTGRESQL DATABASE
 * - ENVIRONMENT VARIABLES CONFIGURED
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const { sequelize, connectDB } = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const mediaRoutes = require('./routes/mediaRoutes');

// LOAD ENVIRONMENT VARIABLES FROM .ENV FILE
dotenv.config();

/**
 * EXPRESS APPLICATION INSTANCE
 * @type {express.Application}
 */
const app = express();

/**
 * MIDDLEWARE CONFIGURATION
 * REGISTERS GLOBAL MIDDLEWARE FOR ALL ROUTES
 */

// CROSS-ORIGIN RESOURCE SHARING (CORS)
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000', // ALLOWED ORIGINS
  credentials: true // ENABLE COOKIES/CREDENTIALS IN CORS
}));

// JSON REQUEST BODY PARSER
app.use(express.json());

// COOKIE PARSER FOR JWT TOKENS
app.use(cookieParser());

/**
 * ROUTE CONFIGURATION
 * MODULAR ROUTE HANDLERS FOR DIFFERENT API SECTIONS
 */

// MOUNT ROUTES WITH PATH PREFIXES
app.use('/api/auth', authRoutes); // AUTHENTICATION ENDPOINTS
app.use('/api/media', mediaRoutes); // MEDIA SEARCH ENDPOINTS

/**
 * BASE HEALTH CHECK ENDPOINT
 * PROVIDES SERVER STATUS VERIFICATION
 */
app.get('/', (req, res) => {
  res.send('WELCOME TO KELANZY!! OPEN MEDIA SEARCH API');
});

/**
 * GLOBAL ERROR HANDLER
 * CATCHES UNHANDLED ERRORS AND PREVENTS SERVER CRASHES
 */
app.use((err, req, res, next) => {
  console.error('UNHANDLED ERROR:', err.stack);
  res.status(500).json({ message: 'INTERNAL SERVER ERROR' });
});

/**
 * ENHANCED DATABASE INITIALIZATION
 * PROPERLY HANDLES MODEL SYNCING AND CONNECTION
 */
async function initializeDatabase() {
  try {
    await connectDB(); // Test connection first
    await sequelize.sync({ alter: true }); // Sync models with database
    console.log('Database synchronized successfully');
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1); // Exit on critical DB failure
  }
}

/**
 * SERVER INITIALIZATION FLOW
 */
async function startServer() {
  const PORT = process.env.PORT || 5000;
  
  try {
    await initializeDatabase();
    
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Server startup failed:', error);
    process.exit(1);
  }
}

// Start the application
startServer();

/**
 * PRODUCTION CONSIDERATIONS:
 * 1. IMPLEMENT REVERSE PROXY (NGINX) FOR SSL TERMINATION
 * 2. ENABLE COMPRESSION MIDDLEWARE FOR PERFORMANCE
 * 3. USE PROCESS MANAGER (PM2) FOR CLUSTERING
 * 4. CONFIGURE LOG ROTATION FOR ACCESS/ERROR LOGS
 * 
 * SECURITY RECOMMENDATIONS:
 * 1. SET SECURE COOKIE FLAGS IN PRODUCTION
 * 2. IMPLEMENT HELMET MIDDLEWARE FOR HEADERS
 * 3. USE CSRF TOKENS FOR STATE-CHANGING REQUESTS
 * 4. REGULARLY ROTATE JWT SECRET KEY
 * 
 * ENVIRONMENT VARIABLES:
 * - PORT: SERVER LISTENING PORT
 * - CLIENT_URL: FRONTEND ORIGIN URL
 * - DATABASE_URL: POSTGRES CONNECTION STRING
 * - JWT_SECRET: TOKEN SIGNING KEY
 * 
 * RELATED MODULES:
 * - config/db.js: DATABASE CONNECTION LOGIC
 * - routes/authRoutes.js: AUTHENTICATION ENDPOINTS
 * - routes/mediaRoutes.js: MEDIA SEARCH ENDPOINTS
 * - controllers/authController.js: AUTH BUSINESS LOGIC
 */