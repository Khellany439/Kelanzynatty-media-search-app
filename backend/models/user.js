/**
 * USER DATA MODEL MODULE
 * PROVIDES DATABASE OPERATIONS FOR USER MANAGEMENT INCLUDING REGISTRATION,
 * AUTHENTICATION, AND PROFILE RETRIEVAL. IMPLEMENTS PASSWORD SECURITY
 * THROUGH BCRYPT HASHING AND SALTING.
 * 
 * KEY FUNCTIONALITIES:
 * - USER REGISTRATION WITH PASSWORD HASHING
 * - USER LOOKUP BY EMAIL OR ID
 * - PASSWORD VERIFICATION WITH TIMING-SAFE COMPARISON
 * - SENSITIVE DATA EXCLUSION IN PUBLIC QUERIES
 * 
 * AUTHOR: KELANZY
 * DATE: 2023-10-23
 * VERSION: 1.0.0
 * REQUIREMENTS:
 * - BCRYPT: PASSWORD HASHING LIBRARY
 * - MYSQL DATABASE CONNECTION POOL
 * - USERS TABLE SCHEMA:
 *   (id, name, email, password, created_at)
 */

const db = require('../config/db');
const bcrypt = require('bcrypt');

const User = {
  /**
   * USER REGISTRATION OPERATION
   * 
   * @param {Object} userData - {name: STRING, email: STRING, password: STRING}
   * @returns {Promise<number>} INSERTED USER ID
   * 
   * PROCESS:
   * 1. HASHES PASSWORD WITH BCRYPT (SALT ROUNDS: 10)
   * 2. STORES USER IN DATABASE
   * 3. RETURNS NEW USER IDENTIFIER
   * 
   * SECURITY:
   * - USES PARAMETERIZED QUERIES TO PREVENT SQL INJECTION
   * - NEVER STORES PLAINTEXT PASSWORDS
   */
  async register({ name, email, password }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.execute(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );
    return result.insertId;
  },

  /**
   * USER LOOKUP BY EMAIL ADDRESS
   * 
   * @param {string} email - USER EMAIL ADDRESS
   * @returns {Promise<Object|null>} USER OBJECT WITH SENSITIVE FIELDS
   * 
   * USAGE:
   * - PRIMARILY USED DURING AUTHENTICATION PROCESS
   * - RETURNS FULL USER RECORD INCLUDING PASSWORD HASH
   */
  async findByEmail(email) {
    const [rows] = await db.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return rows[0];
  },

  /**
   * PUBLIC USER PROFILE RETRIEVAL
   * 
   * @param {number} id - USER IDENTIFIER
   * @returns {Promise<Object|null>} SANITIZED USER OBJECT
   * 
   * SECURITY:
   * - EXCLUDES SENSITIVE PASSWORD FIELD
   * - ONLY RETURNS PUBLIC PROFILE DATA
   */
  async findById(id) {
    const [rows] = await db.execute(
      'SELECT id, name, email, created_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0];
  },

  /**
   * PASSWORD VERIFICATION METHOD
   * 
   * @param {string} plainPassword - USER-SUPPLIED PASSWORD
   * @param {string} hashedPassword - STORED PASSWORD HASH
   * @returns {Promise<boolean>} PASSWORD MATCH STATUS
   * 
   * SECURITY:
   * - USES TIMING-SAFE COMPARISON TO PREVENT SIDE-CHANNEL ATTACKS
   * - REQUIRES BCRYPT HASHED PASSWORDS FOR VALIDATION
   */
  async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
};

/**
 * SECURITY CONSIDERATIONS:
 * 1. IMPLEMENT RATE LIMITING ON AUTHENTICATION ATTEMPTS
 * 2. ENFORCE STRONG PASSWORD POLICIES (MIN LENGTH, COMPLEXITY)
 * 3. USE HTTPS FOR ALL USER DATA TRANSMISSION
 * 4. REGULARLY ROTATE BCRYPT SALT ROUNDS AS HARDWARE IMPROVES
 * 
 * ERROR HANDLING STRATEGY:
 * 1. PROPAGATE DATABASE ERRORS TO CONTROLLER LAYER
 * 2. USE TRANSACTIONS FOR CRITICAL OPERATIONS
 * 3. IMPLEMENT UNIQUE CONSTRAINT ON EMAIL FIELD
 * 
 * PERFORMANCE OPTIMIZATIONS:
 * - DATABASE INDEXES ON EMAIL AND ID FIELDS
 * - CACHE FREQUENTLY ACCESSED USER PROFILES
 * - BALANCE BCRYPT COST FACTOR BETWEEN SECURITY AND PERFORMANCE
 */

/**
 * RELATED MODULES:
 * - authController.js: CONSUMES AUTHENTICATION METHODS
 * - db.js: PROVIDES DATABASE CONNECTION POOL
 * - middleware.js: HANDLES AUTHENTICATION MIDDLEWARE
 */

module.exports = User;
