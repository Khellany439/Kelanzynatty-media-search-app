/**
 * MEDIA CONTROLLER MODULE
 * HANDLES MEDIA SEARCH OPERATIONS USING OPENVERSE API AND MANAGES USER SEARCH HISTORY.
 * INTEGRATES EXTERNAL API CALLS WITH DATABASE OPERATIONS FOR SEARCH PERSISTENCE.
 * 
 * KEY FUNCTIONALITIES:
 * - OPENVERSE MEDIA SEARCH WITH FILTERING
 * - USER-SPECIFIC SEARCH HISTORY MANAGEMENT
 * - SEARCH RECORD CRUD OPERATIONS
 * 
 * AUTHOR: KELANZY
 * DATE: 2023-10-23
 * VERSION: 1.0.0
 * REQUIREMENTS:
 * - AXIOS: HTTP CLIENT FOR API REQUESTS
 * - MYSQL DATABASE CONNECTION
 * - OPENVERSE API ACCESS
 */

const axios = require('axios');
const db = require('../config/db');

/**
 * OPENVERSE API CONFIGURATION
 * BASE URL FOR OPENVERSE REST API V1 ENDPOINT
 * @constant {string}
 */
const OPENVERSE_API_BASE = 'https://api.openverse.org/v1';

/**
 * MEDIA SEARCH CONTROLLER
 * 
 * @param {Object} req - EXPRESS REQUEST OBJECT WITH QUERY PARAMS
 * @param {Object} res - EXPRESS RESPONSE OBJECT
 * 
 * QUERY PARAMETERS:
 * - q: SEARCH QUERY STRING (REQUIRED)
 * - media_type: MEDIA TYPE FILTER (DEFAULT: 'image')
 * - license: LICENSE TYPE FILTER
 * - extension: FILE EXTENSION FILTER
 * 
 * RESPONSES:
 * - 200 OK: SEARCH RESULTS FROM OPENVERSE
 * - 400 BAD REQUEST: MISSING SEARCH QUERY
 * - 500 INTERNAL ERROR: API OR DATABASE FAILURE
 * 
 * PROCESS FLOW:
 * 1. VALIDATE REQUIRED QUERY PARAMETER
 * 2. EXECUTE OPENVERSE API REQUEST
 * 3. OPTIONALLY STORE SEARCH FOR AUTHENTICATED USERS
 * 4. RETURN API RESPONSE DATA
 */
exports.searchMedia = async (req, res) => {
  const { q, media_type = 'image', license, extension } = req.query;

  if (!q) return res.status(400).json({ message: 'SEARCH QUERY IS REQUIRED' });

  try {
    // EXECUTE OPENVERSE API REQUEST
    const response = await axios.get(`${OPENVERSE_API_BASE}/${media_type}`, {
      params: { q, license, extension },
    });

    // PERSIST SEARCH FOR AUTHENTICATED USERS
    if (req.user) {
      await db.execute(
        'INSERT INTO searches (user_id, query, media_type) VALUES (?, ?, ?)',
        [req.user.id, q, media_type]
      );
    }

    return res.json(response.data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'ERROR FETCHING DATA FROM OPENVERSE' });
  }
};

/**
 * RECENT SEARCHES CONTROLLER
 * 
 * @param {Object} req - AUTHENTICATED REQUEST OBJECT
 * @param {Object} res - EXPRESS RESPONSE OBJECT
 * 
 * RESPONSES:
 * - 200 OK: ARRAY OF 10 MOST RECENT SEARCHES
 * - 500 INTERNAL ERROR: DATABASE FAILURE
 * 
 * SECURITY:
 * - REQUIRES VALID AUTHENTICATION TOKEN
 * - ONLY RETURNS USER'S OWN SEARCH HISTORY
 */
exports.getRecentSearches = async (req, res) => {
  try {
    const [results] = await db.execute(
      'SELECT id, query, media_type, created_at FROM searches WHERE user_id = ? ORDER BY created_at DESC LIMIT 10',
      [req.user.id]
    );
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'ERROR RETRIEVING RECENT SEARCHES' });
  }
};

/**
 * SEARCH DELETION CONTROLLER
 * 
 * @param {Object} req - REQUEST WITH SEARCH ID PARAMETER
 * @param {Object} res - EXPRESS RESPONSE OBJECT
 * 
 * PARAMETERS:
 * - searchId: ID OF SEARCH RECORD TO DELETE
 * 
 * RESPONSES:
 * - 200 OK: SUCCESSFUL DELETION
 * - 404 NOT FOUND: INVALID SEARCH ID OR UNAUTHORIZED
 * - 500 INTERNAL ERROR: DATABASE FAILURE
 * 
 * SECURITY:
 * - ENSURES USER ONLY DELETES THEIR OWN SEARCHES
 */
exports.deleteSearch = async (req, res) => {
  const { searchId } = req.params;

  try {
    const [result] = await db.execute(
      'DELETE FROM searches WHERE id = ? AND user_id = ?',
      [searchId, req.user.id]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ message: 'SEARCH NOT FOUND OR UNAUTHORIZED' });

    res.json({ message: 'SEARCH DELETED SUCCESSFULLY' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'ERROR DELETING SEARCH' });
  }
};

/**
 * PERFORMANCE CONSIDERATIONS:
 * 1. IMPLEMENT API RESPONSE CACHING FOR FREQUENT QUERIES
 * 2. ADD PAGINATION SUPPORT FOR LARGE RESULT SETS
 * 3. USE DATABASE INDEXES ON SEARCHES.USER_ID AND CREATED_AT
 * 
 * SECURITY IMPROVEMENTS:
 * 1. SANITIZE USER INPUT FOR SEARCH QUERY PARAMETERS
 * 2. LIMIT MAX SEARCH HISTORY ITEMS PER USER
 * 3. IMPLEMENT RATE LIMITING FOR API REQUESTS
 * 
 * ERROR HANDLING STRATEGY:
 * 1. ADD RETRY LOGIC FOR OPENVERSE API CALLS
 * 2. IMPLEMENT CIRCUIT BREAKER PATTERN FOR EXTERNAL API
 * 3. USE TRANSACTIONS FOR DATABASE WRITE OPERATIONS
 */

/**
 * RELATED MODULES:
 * - authMiddleware.js: HANDLES USER AUTHENTICATION
 * - openverseClient.js: POTENTIAL ABSTRACTION FOR API CALLS
 * - searchModel.js: DATA LAYER FOR SEARCH OPERATIONS
 * - cacheMiddleware.js: RESPONSE CACHING IMPLEMENTATION
 */

/**
 * OPENVERSE API DOCUMENTATION NOTES:
 * - SUPPORTED MEDIA TYPES: IMAGE, AUDIO, VIDEO
 * - LICENSE TYPES: CC0, CC-BY, CC-BY-SA, ETC.
 * - RATE LIMIT: 200 REQUESTS/DAY (CHECK CURRENT POLICIES)
 * - RESPONSE FORMAT: JSON WITH PAGINATION METADATA
 */
