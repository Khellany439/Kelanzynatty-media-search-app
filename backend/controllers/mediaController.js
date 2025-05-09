/**
 * Media Controller Module
 * 
 * Handles media search operations using Openverse API and manages user search history.
 * Implements robust error handling and TypeScript interfaces for better maintainability.
 * 
 * @module controllers/mediaController
 * @author Kelanzy
 * @version 2.0.0
 * @license MIT
 */

import { Request, Response } from 'express';
import axios, { AxiosError } from 'axios';
import { db } from '../config/database';
import { logger } from '../utils/logger';
import { validationResult } from 'express-validator';

// Type definitions
interface OpenverseMedia {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  license: string;
  creator: string;
}

interface OpenverseResponse {
  result_count: number;
  page_count: number;
  results: OpenverseMedia[];
}

interface SearchParams {
  q: string;
  media_type?: 'image' | 'audio' | 'video';
  license?: string;
  extension?: string;
  page?: number;
}

interface SearchRecord {
  id: number;
  query: string;
  media_type: string;
  created_at: Date;
}

// Constants
const OPENVERSE_API_BASE = 'https://api.openverse.org/v1';
const MAX_SEARCH_HISTORY = 10;
const DEFAULT_MEDIA_TYPE = 'image';

/**
 * Search media using Openverse API
 * 
 * @async
 * @function searchMedia
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export const searchMedia = async (
  req: Request<{}, {}, {}, SearchParams>,
  res: Response
): Promise<Response> => {
  // Input validation
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn('Search validation failed', { errors: errors.array() });
    return res.status(400).json({ 
      message: 'Validation failed',
      errors: errors.array() 
    });
  }

  const { q, media_type = DEFAULT_MEDIA_TYPE, license, extension, page = 1 } = req.query;

  try {
    // Execute Openverse API request
    const response = await axios.get<OpenverseResponse>(
      `${OPENVERSE_API_BASE}/${media_type}/`, 
      {
        params: { q, license, extension, page },
        timeout: 5000 // 5 second timeout
      }
    );

    // Persist search for authenticated users
    if (req.user) {
      try {
        await db.query(
          'INSERT INTO searches (user_id, query, media_type) VALUES (?, ?, ?)',
          [req.user.id, q, media_type]
        );
        logger.info('Search recorded', { userId: req.user.id, query: q });
      } catch (dbError) {
        logger.error('Failed to save search history', {
          userId: req.user.id,
          error: dbError instanceof Error ? dbError.message : 'Unknown error'
        });
      }
    }

    return res.json({
      success: true,
      count: response.data.result_count,
      results: response.data.results
    });

  } catch (error) {
    const axiosError = error as AxiosError;
    
    logger.error('Openverse API error', {
      query: q,
      error: axiosError.message,
      status: axiosError.response?.status,
      url: axiosError.config?.url
    });

    if (axiosError.response) {
      return res.status(axiosError.response.status).json({
        message: 'Openverse API error',
        status: axiosError.response.status
      });
    }

    return res.status(500).json({ 
      message: 'Error fetching media',
      error: 'API_REQUEST_FAILED'
    });
  }
};

/**
 * Get recent searches for authenticated user
 * 
 * @async
 * @function getRecentSearches
 * @param {Request} req - Authenticated request
 * @param {Response} res - Express response
 */
export const getRecentSearches = async (
  req: Request,
  res: Response<SearchRecord[] | { message: string }>
): Promise<Response> => {
  if (!req.user) {
    logger.warn('Unauthorized recent searches attempt');
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const [results] = await db.query<SearchRecord[]>(
      `SELECT id, query, media_type, created_at 
       FROM searches 
       WHERE user_id = ? 
       ORDER BY created_at DESC 
       LIMIT ?`,
      [req.user.id, MAX_SEARCH_HISTORY]
    );

    logger.debug('Fetched recent searches', { userId: req.user.id });
    return res.json(results);

  } catch (error) {
    logger.error('Database error fetching searches', {
      userId: req.user.id,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return res.status(500).json({ message: 'Error retrieving search history' });
  }
};

/**
 * Delete a search record
 * 
 * @async
 * @function deleteSearch
 * @param {Request} req - Request with search ID
 * @param {Response} res - Express response
 */
export const deleteSearch = async (
  req: Request<{ searchId: string }>,
  res: Response
): Promise<Response> => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { searchId } = req.params;

  try {
    const [result] = await db.query(
      'DELETE FROM searches WHERE id = ? AND user_id = ?',
      [searchId, req.user.id]
    );

    if (result.affectedRows === 0) {
      logger.warn('Search deletion failed - not found or unauthorized', {
        userId: req.user.id,
        searchId
      });
      return res.status(404).json({ message: 'Search not found or unauthorized' });
    }

    logger.info('Search deleted', { userId: req.user.id, searchId });
    return res.json({ message: 'Search deleted successfully' });

  } catch (error) {
    logger.error('Error deleting search', {
      searchId,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return res.status(500).json({ message: 'Error deleting search' });
  }
};

/**
 * Middleware for validating search parameters
 */
export const validateSearchParams = [
  // Validate query exists and is not empty
  (req: Request, res: Response, next: Function) => {
    if (!req.query.q) {
      return res.status(400).json({ message: 'Search query is required' });
    }
    next();
  },
  // Validate media_type if provided
  (req: Request, res: Response, next: Function) => {
    if (req.query.media_type && !['image', 'audio', 'video'].includes(req.query.media_type)) {
      return res.status(400).json({ message: 'Invalid media type' });
    }
    next();
  }
];

/**
 * Utility function to cache Openverse API responses
 */
const cacheApiResponse = async (key: string, data: any): Promise<void> => {
  // Implementation would use Redis or similar
  // Example: await redisClient.setex(key, 3600, JSON.stringify(data));
};

/**
 * Utility function to get cached Openverse API responses
 */
const getCachedResponse = async (key: string): Promise<any | null> => {
  // Implementation would use Redis or similar
  // Example: const cached = await redisClient.get(key);
  // return cached ? JSON.parse(cached) : null;
  return null;
};