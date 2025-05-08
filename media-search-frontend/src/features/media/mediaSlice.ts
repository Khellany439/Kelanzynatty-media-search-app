/**
 * @module mediaSlice
 * @description 
 * Redux slice for managing media search and retrieval from Openverse API.
 * Handles:
 * - Paginated media searches
 * - Search metadata management
 * - API error handling
 * - Media item normalization
 * 
 * @architecture
 * - Uses Redux Toolkit for state management
 * - Normalizes API responses
 * - Maintains search pagination state
 * - Type-safe throughout
 * 
 * @dependencies
 * - @reduxjs/toolkit: State management
 * - axios: HTTP client
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

// ==================== TYPE DEFINITIONS ====================

/**
 * @interface MediaItem
 * @description Normalized media item structure
 * 
 * @property {string} id - Unique identifier
 * @property {string} title - Display title
 * @property {string} [creator] - Content creator
 * @property {string} url - Source URL
 * @property {string} thumbnail - Preview image URL
 * @property {string} license - Content license type
 * @property {string} [license_version] - License version
 * @property {string[]} tags - Associated tags
 * @property {string} provider - Source provider
 * @property {string} created_at - Creation timestamp
 */
interface MediaItem {
  id: string;
  title: string;
  creator?: string;
  url: string;
  thumbnail: string;
  license: string;
  license_version?: string;
  tags: string[];
  provider: string;
  created_at: string;
}

/**
 * @interface MediaState
 * @description Media module state shape
 * 
 * @property {MediaItem[]} items - Retrieved media items
 * @property {'idle'|'loading'|'succeeded'|'failed'} status - Current operation state
 * @property {string|null} error - Last error message
 * @property {Object} searchMeta - Search metadata
 * @property {string} searchMeta.query - Current search query
 * @property {number} searchMeta.page - Current page number
 * @property {boolean} searchMeta.hasMore - Whether more items are available
 */
interface MediaState {
  items: MediaItem[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  searchMeta: {
    query: string;
    page: number;
    hasMore: boolean;
  };
}

/**
 * @interface SearchParams
 * @description Media search parameters
 * 
 * @property {string} query - Search query string
 * @property {'image'|'audio'|'video'} [mediaType] - Media type filter
 * @property {string} [license] - License type filter
 * @property {number} [page] - Pagination page number
 */
interface SearchParams {
  query: string;
  mediaType?: 'image' | 'audio' | 'video';
  license?: string;
  page?: number;
}

// ==================== INITIAL STATE ====================
const initialState: MediaState = {
  items: [],
  status: 'idle',
  error: null,
  searchMeta: {
    query: '',
    page: 1,
    hasMore: false
  }
};

// ==================== ASYNC THUNKS ====================

/**
 * @function fetchMedia
 * @description Fetches media items from Openverse API
 * 
 * @param {SearchParams} searchParams - Search criteria
 * @returns {Promise<MediaItem[]>} Normalized media items
 * 
 * @errorHandling
 * - Captures API errors
 * - Normalizes error messages
 * - Rejects with consistent error format
 * 
 * @normalization
 * - Transforms API response to consistent shape
 * - Provides fallback values
 */
export const fetchMedia = createAsyncThunk<MediaItem[], SearchParams, { rejectValue: string }>(
  'media/fetchMedia',
  async (searchParams, { rejectWithValue }) => {
    try {
      const { query, mediaType = 'image', license, page = 1 } = searchParams;
      
      const response = await axios.get('https://api.openverse.org/v1/', {
        params: {
          q: query,
          license_type: license || 'commercial,modification',
          page: page.toString(),
          format: 'json',
          type: mediaType
        },
        timeout: 10000 // 10 second timeout
      });

      if (!response.data?.results) {
        throw new Error('Invalid API response structure');
      }

      return response.data.results.map((item: any) => ({
        id: item.id,
        title: item.title || 'Untitled',
        creator: item.creator,
        url: item.url,
        thumbnail: item.thumbnail || '/placeholder.jpg',
        license: item.license || 'unknown',
        license_version: item.license_version,
        tags: item.tags?.map((t: any) => t.name) || [],
        provider: item.provider || 'unknown',
        created_at: item.created_on || new Date().toISOString()
      }));
    } catch (err) {
      if (axios.isAxiosError(err)) {
        // Handle different types of Axios errors
        if (err.code === 'ECONNABORTED') {
          return rejectWithValue('Request timeout');
        }
        return rejectWithValue(err.response?.data?.detail || 'Network error');
      }
      return rejectWithValue((err as Error).message || 'Failed to fetch media');
    }
  }
);

// ==================== SLICE DEFINITION ====================
const mediaSlice = createSlice({
  name: 'media',
  initialState,
  reducers: {
    /**
     * @reducer clearMedia
     * @description Resets media state to initial values
     * 
     * @useCase
     * - When starting a new search
     * - When clearing search results
     */
    clearMedia: (state) => {
      state.items = [];
      state.searchMeta = initialState.searchMeta;
      state.status = 'idle';
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      /**
       * @handler fetchMedia.pending
       * @description Handles media fetch start
       * 
       * @stateUpdates
       * - Sets loading status
       * - Resets state for new queries
       * - Preserves state for pagination
       */
      .addCase(fetchMedia.pending, (state, action) => {
        state.status = 'loading';
        state.error = null;
        
        if (action.meta.arg.query !== state.searchMeta.query) {
          state.searchMeta = {
            query: action.meta.arg.query,
            page: 1,
            hasMore: false
          };
          state.items = [];
        }
      })
      
      /**
       * @handler fetchMedia.fulfilled
       * @description Handles successful media fetch
       * 
       * @stateUpdates
       * - Appends new results
       * - Updates pagination state
       * - Sets success status
       */
      .addCase(fetchMedia.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = [...state.items, ...action.payload];
        state.searchMeta.page += 1;
        state.searchMeta.hasMore = action.payload.length > 0;
      })
      
      /**
       * @handler fetchMedia.rejected
       * @description Handles failed media fetch
       * 
       * @stateUpdates
       * - Sets error state
       * - Preserves existing items
       * - Sets failed status
       */
      .addCase(fetchMedia.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Unknown error occurred';
      });
  }
});

// ==================== SELECTORS ====================
// (To be defined in separate selectors file)

// ==================== EXPORTS ====================
export const { clearMedia } = mediaSlice.actions;
export default mediaSlice.reducer;