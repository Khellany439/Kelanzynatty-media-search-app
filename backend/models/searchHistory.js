/**
 * Search History Data Model
 * 
 * Provides type-safe database operations for user search history management.
 * Implements CRUD operations with proper user isolation and error handling.
 * 
 * @module models/SearchHistory
 * @version 2.0.0
 * @license MIT
 */

import { db } from '../config/database';
import { logger } from '../utils/logger';

// Type definitions
interface SearchRecord {
  id: number;
  user_id: number;
  query: string;
  media_type: 'image' | 'audio' | 'video';
  created_at: Date;
}

interface SearchHistoryResult {
  id: number;
  query: string;
  media_type: string;
  created_at: Date;
}

class SearchHistory {
  /**
   * Save a user search operation
   * 
   * @param userId - Authenticated user ID
   * @param query - Search query string
   * @param mediaType - Type of media searched
   * @returns Promise with the inserted record ID
   * 
   * @throws Database errors
   */
  static async save(
    userId: number,
    query: string,
    mediaType: 'image' | 'audio' | 'video'
  ): Promise<number> {
    try {
      const [result] = await db.execute<{ insertId: number }>(
        `INSERT INTO searches (user_id, query, media_type) 
         VALUES (?, ?, ?)`,
        [userId, query, mediaType]
      );
      
      logger.debug('Search saved', { userId, query, mediaType });
      return result.insertId;
      
    } catch (error) {
      logger.error('Failed to save search', { 
        userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw new Error('Failed to save search history');
    }
  }

  /**
   * Retrieve user's recent searches
   * 
   * @param userId - Authenticated user ID
   * @param limit - Maximum results to return (default: 10)
   * @returns Promise with array of search records
   */
  static async getRecent(
    userId: number, 
    limit: number = 10
  ): Promise<SearchHistoryResult[]> {
    try {
      const [results] = await db.execute<SearchHistoryResult[]>(
        `SELECT id, query, media_type, created_at 
         FROM searches 
         WHERE user_id = ? 
         ORDER BY created_at DESC 
         LIMIT ?`,
        [userId, limit]
      );
      
      return results;
      
    } catch (error) {
      logger.error('Failed to fetch search history', { 
        userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw new Error('Failed to retrieve search history');
    }
  }

  /**
   * Delete a specific search record
   * 
   * @param userId - Authenticated user ID
   * @param searchId - Target search record ID
   * @returns Promise with deletion success status
   * 
   * @throws Database errors
   */
  static async delete(
    userId: number, 
    searchId: number
  ): Promise<boolean> {
    try {
      const [result] = await db.execute<{ affectedRows: number }>(
        `DELETE FROM searches 
         WHERE id = ? AND user_id = ?`,
        [searchId, userId]
      );
      
      const success = result.affectedRows > 0;
      if (success) {
        logger.info('Search deleted', { userId, searchId });
      } else {
        logger.warn('Search deletion failed - not found or unauthorized', { 
          userId, 
          searchId 
        });
      }
      
      return success;
      
    } catch (error) {
      logger.error('Failed to delete search', { 
        userId,
        searchId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw new Error('Failed to delete search record');
    }
  }

  /**
   * Clear all search history for a user
   * 
   * @param userId - Authenticated user ID
   * @returns Promise with deletion count
   */
  static async clearAll(
    userId: number
  ): Promise<number> {
    try {
      const [result] = await db.execute<{ affectedRows: number }>(
        `DELETE FROM searches 
         WHERE user_id = ?`,
        [userId]
      );
      
      logger.info('Cleared all search history', { 
        userId,
        count: result.affectedRows 
      });
      
      return result.affectedRows;
      
    } catch (error) {
      logger.error('Failed to clear search history', { 
        userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw new Error('Failed to clear search history');
    }
  }
}

export { SearchHistory, SearchHistoryResult };