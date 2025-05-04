/**
 * SEARCH HISTORY DATA MODEL
 * PROVIDES DATABASE OPERATIONS FOR USER SEARCH HISTORY MANAGEMENT.
 * IMPLEMENTS CRUD OPERATIONS FOR SEARCH RECORDS WITH USER-SPECIFIC DATA ISOLATION.
 * 
 * KEY FUNCTIONALITIES:
 * - SEARCH HISTORY PERSISTENCE
 * - RECENT SEARCH RETRIEVAL
 * - SEARCH RECORD DELETION
 * 
 * AUTHOR: KELANZY
 * DATE: 2023-10-23
 * VERSION: 1.0.0
 * REQUIREMENTS:
 * - MYSQL DATABASE CONNECTION POOL
 * - SEARCHES TABLE SCHEMA:
 *   (id, user_id, query, media_type, created_at)
 */

const db = require('../config/db');

const SearchHistory = {
  /**
   * SAVE USER SEARCH OPERATION
   * 
   * @param {number} userId - AUTHENTICATED USER ID
   * @param {string} query - SEARCH QUERY STRING
   * @param {string} mediaType - MEDIA TYPE FILTER
   * @returns {Promise<number>} INSERTED SEARCH RECORD ID
   * 
   * ERROR HANDLING:
   * - THROWS DATABASE ERRORS TO CALLER
   * - PROPAGATES CONSTRAINT VIOLATIONS
   */
  async save(userId, query, mediaType) {
    const [result] = await db.execute(
      'INSERT INTO searches (user_id, query, media_type) VALUES (?, ?, ?)',
      [userId, query, mediaType]
    );
    return result.insertId;
  },

  /**
   * RETRIEVE USER'S RECENT SEARCHES
   * 
   * @param {number} userId - AUTHENTICATED USER ID
   * @param {number} limit - MAXIMUM RESULTS TO RETURN (DEFAULT: 10)
   * @returns {Promise<Array>} ARRAY OF SEARCH RECORDS
   * 
   * FEATURES:
   * - RESULTS ORDERED BY RECENT FIRST
   * - EXCLUDES SENSITIVE INTERNAL FIELDS
   * - LIMITS RESULTS TO PREVENT OVERFETCHING
   */
  async getRecent(userId, limit = 10) {
    const [results] = await db.execute(
      'SELECT id, query, media_type, created_at FROM searches WHERE user_id = ? ORDER BY created_at DESC LIMIT ?',
      [userId, limit]
    );
    return results;
  },

  /**
   * DELETE SPECIFIC SEARCH RECORD
   * 
   * @param {number} userId - AUTHENTICATED USER ID
   * @param {number} searchId - TARGET SEARCH RECORD ID
   * @returns {Promise<boolean>} DELETION SUCCESS STATUS
   * 
   * SECURITY:
   * - ENSURES USER OWNERSHIP BEFORE DELETION
   * - PREVENTS CROSS-USER DATA MODIFICATION
   */
  async delete(userId, searchId) {
    const [result] = await db.execute(
      'DELETE FROM searches WHERE id = ? AND user_id = ?',
      [searchId, userId]
    );
    return result.affectedRows > 0;
  },
};

/**
 * ERROR HANDLING STRATEGY:
 * 1. ALL ERRORS PROPAGATE TO CALLER FOR CONTEXT-SPECIFIC HANDLING
 * 2. USE TRANSACTIONAL QUERIES FOR CRITICAL OPERATIONS
 * 3. IMPLEMENT DATABASE CONNECTION HEALTH CHECKS
 * 
 * PERFORMANCE OPTIMIZATIONS:
 * - INDEX ON (user_id, created_at) FOR FAST RECENT LOOKUPS
 * - QUERY CACHING FOR FREQUENT SEARCH PATTERNS
 * - ARCHIVE OLD SEARCHES TO SEPARATE TABLE
 * 
 * FUTURE ENHANCEMENTS:
 * 1. ADD SEARCH CATEGORY TAGGING
 * 2. IMPLEMENT SEARCH FILTER PRESETS
 * 3. ADD SOFT DELETE FUNCTIONALITY
 * 4. INCLUDE SEARCH RESULT METADATA STORAGE
 */

/**
 * RELATED MODULES:
 * - mediaController.js: CONSUMES SEARCH HISTORY OPERATIONS
 * - db.js: PROVIDES DATABASE CONNECTION POOL
 * - userModel.js: MANAGES USER DATA RELATIONSHIPS
 * - cache.js: HANDLES QUERY RESULT CACHING
 */

module.exports = SearchHistory;
