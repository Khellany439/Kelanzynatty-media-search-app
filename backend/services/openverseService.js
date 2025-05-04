/**
 * OPENVERSE API CLIENT MODULE
 * PROVIDES INTERFACE FOR SEARCHING OPENVERSE'S MEDIA CONTENT API.
 * HANDLES PAGINATION, ERROR MANAGEMENT, AND QUERY PARAMETER VALIDATION.
 * 
 * KEY FEATURES:
 * - MEDIA TYPE FILTERING (IMAGES, AUDIO)
 * - PAGINATION SUPPORT WITH DEFAULT VALUES
 * - ERROR HANDLING AND LOGGING
 * - PARAMETER SANITIZATION
 * 
 * AUTHOR: KELANZY
 * DATE: 2023-10-23
 * VERSION: 1.0.0
 * REQUIREMENTS:
 * - AXIOS HTTP CLIENT
 * - OPENVERSE API ACCESS
 */

const axios = require('axios');

/**
 * SEARCH OPENVERSE MEDIA CONTENT
 * 
 * @param {Object} query - SEARCH PARAMETERS OBJECT
 * @param {string} query.q - SEARCH QUERY STRING (REQUIRED)
 * @param {string} [query.media_type='image'] - MEDIA TYPE FILTER (image/audio)
 * @param {number} [query.page=1] - PAGINATION PAGE NUMBER
 * @param {number} [query.page_size=20] - RESULTS PER PAGE (MAX 500)
 * 
 * @returns {Promise<Object>} - API RESPONSE OBJECT WITH RESULTS AND METADATA
 * 
 * @throws {Error} - THROWS CLEAN ERROR MESSAGE FOR API FAILURES
 * 
 * EXAMPLE USAGE:
 * const results = await searchOpenverse({
 *   q: 'mountains',
 *   media_type: 'image',
 *   page: 2
 * });
 */
const searchOpenverse = async ({ q, media_type = 'image', page = 1, page_size = 20 }) => {
  try {
    const response = await axios.get(`https://api.openverse.org/v1/${media_type}/`, {
      params: {
        q: q.trim(), // SANITIZE INPUT
        page: Math.max(1, parseInt(page)), // ENSURE VALID PAGE
        page_size: Math.min(500, Math.max(1, parseInt(page_size))) // ENFORCE 1-500 RANGE
      }
    });

    return response.data;
  } catch (error) {
    console.error('OPENVERSE API ERROR:', error.message);
    throw new Error('MEDIA SEARCH FAILED: ' + error.response?.status || 'NETWORK ERROR');
  }
};

/**
 * SECURITY CONSIDERATIONS:
 * 1. ALWAYS SANITIZE USER-PROVIDED SEARCH PARAMETERS
 * 2. IMPLEMENT RATE LIMITING TO PREVENT API ABUSE
 * 3. USE HTTPS IN PRODUCTION ENVIRONMENTS
 * 
 * PERFORMANCE NOTES:
 * - CACHE FREQUENT SEARCH RESULTS LOCALLY
 * - IMPLEMENT RETRY LOGIC FOR TRANSIENT ERRORS
 * - USE COMPRESSION FOR LARGE MEDIA METADATA RESPONSES
 * 
 * ERROR HANDLING STRATEGY:
 * 1. LOG FULL ERROR DETAILS FOR DEBUGGING
 * 2. RETURN USER-FRIENDLY ERROR MESSAGES
 * 3. HANDLE SPECIFIC HTTP STATUS CODES (429 RATE LIMIT, ETC)
 * 
 * MEDIA TYPE SUPPORT:
 * - CURRENTLY SUPPORTS 'image' AND 'audio' TYPES
 * - FUTURE EXPANSION FOR 'video' AND 'TEXT' TYPES
 */

module.exports = {
  searchOpenverse,
};
