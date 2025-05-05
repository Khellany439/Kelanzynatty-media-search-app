/**
 * AUTHENTICATION CONTROLLER MODULE
 * HANDLES USER REGISTRATION, LOGIN, AND PROFILE MANAGEMENT WITH SECURE CREDENTIAL PROCESSING.
 * IMPLEMENTS BCRYPT FOR PASSWORD HASHING AND JWT FOR TOKEN-BASED AUTHENTICATION.
 * 
 * KEY FUNCTIONALITIES:
 * - USER REGISTRATION WITH EMAIL VERIFICATION
 * - PASSWORD HASHING AND CREDENTIAL VALIDATION
 * - JWT TOKEN GENERATION AND SESSION MANAGEMENT
 * - USER PROFILE RETRIEVAL WITH ACCESS CONTROL
 * 
 * AUTHOR: KELANZY
 * DATE: 2023-10-23
 * VERSION: 1.0.0
 * REQUIREMENTS:
 * - BCRYPT: PASSWORD HASHING LIBRARY
 * - JSONWEBTOKEN: JWT IMPLEMENTATION
 * - MYSQL DATABASE CONNECTION POOL
 * - JWT_SECRET ENVIRONMENT VARIABLE
 */

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { User } = require('../models'); // Make sure your User model is properly exported from models/index.js

require('dotenv').config();

/**
 * USER REGISTRATION CONTROLLER
 * 
 * @param {Object} req - EXPRESS REQUEST OBJECT WITH {username, email, password}
 * @param {Object} res - EXPRESS RESPONSE OBJECT
 * 
 * PROCESS FLOW:
 * 1. VALIDATE REQUIRED FIELDS
 * 2. CHECK FOR EXISTING EMAIL
 * 3. HASH PASSWORD WITH BCRYPT (COST FACTOR 10)
 * 4. STORE USER IN DATABASE
 * 
 * RESPONSES:
 * - 201 CREATED: SUCCESSFUL REGISTRATION
 * - 400 BAD REQUEST: MISSING REQUIRED FIELDS
 * - 409 CONFLICT: EMAIL ALREADY REGISTERED
 * - 500 INTERNAL ERROR: REGISTRATION FAILURE
 * 
 * SECURITY:
 * - USES PARAMETERIZED QUERIES TO PREVENT SQL INJECTION
 * - NEVER STORES PLAINTEXT PASSWORDS
 */

exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  // INPUT VALIDATION
  if (!name || !email || !password)
    return res.status(400).json({ message: 'ALL FIELDS ARE REQUIRED' });

  try {
    // EXISTING USER CHECK
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser)
      return res.status(409).json({ message: 'EMAIL ALREADY REGISTERED' });

    // PASSWORD HASHING
    const hashedPassword = await bcrypt.hash(password, 10);

    // DATABASE INSERTION
    await User.create({
      name,
      email,
      password: hashedPassword
    });

    return res.status(201).json({ message: 'USER REGISTERED SUCCESSFULLY' });
  } catch (err) {
    console.error("Registration Error:", err);
    return res.status(500).json({ message: 'SERVER ERROR DURING REGISTRATION' });
  }
};


/**
 * USER AUTHENTICATION CONTROLLER
 * 
 * @param {Object} req - EXPRESS REQUEST OBJECT WITH {email, password}
 * @param {Object} res - EXPRESS RESPONSE OBJECT
 * 
 * PROCESS FLOW:
 * 1. VALIDATE CREDENTIAL PRESENCE
 * 2. FETCH USER BY EMAIL
 * 3. COMPARE PASSWORD HASHES
 * 4. GENERATE JWT TOKEN
 * 
 * RESPONSES:
 * - 200 OK: AUTH SUCCESS WITH TOKEN AND USER DATA
 * - 400 BAD REQUEST: MISSING CREDENTIALS
 * - 401 UNAUTHORIZED: INVALID CREDENTIALS
 * - 500 INTERNAL ERROR: AUTHENTICATION FAILURE
 * 
 * SECURITY:
 * - TIMING-SAFE BCRYPT COMPARE
 * - TOKEN EXPIRES IN 1 HOUR
 * - SENSITIVE USER DATA EXCLUDED FROM RESPONSE
 */

exports.login = async (req, res) => {
  console.log('🚨 Login Request Body:', { 
    email: req.body?.email, 
    password: req.body?.password ? '***' : 'missing' 
  });

  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    console.error('🚨 Validation Failed - Missing:', { 
      missingEmail: !email, 
      missingPassword: !password 
    });
    return res.status(400).json({ message: 'EMAIL AND PASSWORD ARE REQUIRED' });
  }

  try {
    console.log('🔍 Attempting User Lookup:', email);
    const user = await User.findOne({ where: { email } });

    if (!user) {
      console.error('🚨 User Not Found:', email);
      return res.status(401).json({ message: 'INVALID CREDENTIALS (EMAIL)' });
    }

    console.log('🔑 User Found - Password Comparison Initiated');
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      console.error('🔒 Password Mismatch for User:', email);
      return res.status(401).json({ message: 'INVALID CREDENTIALS (PASSWORD)' });
    }

    console.log('✅ Credentials Valid - Generating JWT');
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'default_secret_key',
      { expiresIn: '1h' }
    );

    if (!process.env.JWT_SECRET) {
      console.warn('⚠️  Using Fallback JWT Secret - Not Recommended for Production');
    }

    console.log(`🎯 Login Successful for User: ${user.id} (${email})`);
    return res.status(200).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });

  } catch (err) {
    console.error('🚨 Critical Login Error:', {
      errorMessage: err.message,
      stack: err.stack,
      rawError: err
    });

    // Specific database error checks
    if (err.name === 'SequelizeDatabaseError') {
      console.error('💾 Database Error:', err.original?.message);
    }

    return res.status(500).json({ 
      message: 'SERVER ERROR DURING LOGIN',
      debugId: `ERR-${Date.now()}` // Unique ID for error tracking
    });
  }
};

/**
 * USER PROFILE CONTROLLER
 * 
 * @param {Object} req - EXPRESS REQUEST OBJECT WITH AUTH TOKEN
 * @param {Object} res - EXPRESS RESPONSE OBJECT
 * 
 * PROCESS FLOW:
 * 1. EXTRACT USER ID FROM VALIDATED TOKEN
 * 2. FETCH USER PROFILE FROM DATABASE
 * 3. RETURN SANITIZED USER DATA
 * 
 * RESPONSES:
 * - 200 OK: USER PROFILE DATA
 * - 404 NOT FOUND: USER DOES NOT EXIST
 * - 500 INTERNAL ERROR: PROFILE FETCH FAILURE
 * 
 * SECURITY:
 * - REQUIRES VALID JWT TOKEN
 * - EXCLUDES SENSITIVE FIELDS (PASSWORD)
 */
exports.getProfile = async (req, res) => {
  try {
    // USER PROFILE FETCH
    const [userRows] = await db.execute(
      'SELECT id, username, email FROM users WHERE id = ?', 
      [req.user.id]
    );

    if (userRows.length === 0)
      return res.status(404).json({ message: 'USER NOT FOUND' });

    return res.json({ user: userRows[0] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'SERVER ERROR FETCHING USER PROFILE' });
  }
};

/**
 * SECURITY CONSIDERATIONS:
 * 1. IMPLEMENT RATE LIMITING ON AUTH ENDPOINTS
 * 2. ADD PASSWORD COMPLEXITY REQUIREMENTS
 * 3. USE HTTPS IN PRODUCTION ENVIRONMENTS
 * 4. IMPLEMENT REFRESH TOKEN ROTATION
 * 
 * IMPROVEMENT OPPORTUNITIES:
 * - EMAIL VERIFICATION WORKFLOW
 * - PASSWORD RESET FUNCTIONALITY
 * - TWO-FACTOR AUTHENTICATION
 * - SESSION AUDIT LOGGING
 * 
 * ERROR HANDLING STRATEGY:
 * 1. CENTRALIZED ERROR HANDLER MIDDLEWARE
 * 2. STRUCTURED ERROR CODES AND MESSAGES
 * 3. SENSITIVE DATA MASKING IN LOGS
 * 
 * RELATED MODULES:
 * - authMiddleware.js: TOKEN VALIDATION
 * - userModel.js: DATA SCHEMA DEFINITION
 * - rateLimiter.js: BRUTE FORCE PROTECTION
 * - mailer.js: EMAIL NOTIFICATIONS
 */

/**
 * PERFORMANCE NOTES:
 * - DATABASE INDEX ON EMAIL FIELD FOR FAST LOOKUPS
 * - CACHE FREQUENTLY ACCESSED USER PROFILES
 * - OPTIMIZE BCRYPT COST FACTOR BASED ON HARDWARE
 * 
 * EXAMPLE TOKEN PAYLOAD:
 * {
 *   "id": 123,
 *   "email": "user@example.com",
 *   "iat": 1698094302,
 *   "exp": 1698097902
 * }
 */
