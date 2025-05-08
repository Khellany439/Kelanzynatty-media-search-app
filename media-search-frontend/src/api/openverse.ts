import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

/**
 * Base URL for the Openverse API v1
 * @constant {string}
 */
const BASE_URL: string = 'https://api.openverse.org/v1/';

/**
 * Supported media types for Openverse API
 * @typedef {'image' | 'audio'} MediaType
 */
export type MediaType = 'image' | 'audio';

/**
 * License information for Openverse media
 * @interface
 */
export interface LicenseInfo {
  code: string;
  name: string;
  url: string;
}

/**
 * Openverse API media item representation
 * @interface
 */
export interface OpenverseMedia {
  /** Unique identifier for the media item */
  id: string;
  /** Title of the media item (defaults to 'Untitled' if not provided) */
  title: string;
  /** Direct URL to access the media file */
  url: string;
  /** URL of the thumbnail/preview image */
  thumbnail: string;
  /** Name of the content provider */
  provider: string;
  /** Source of the content */
  source: string;
  /** License information */
  license: LicenseInfo;
  /** Type of media (image/audio) */
  type: MediaType;
  /** Date when the media was created */
  created_date?: string;
  /** List of tags associated with the media */
  tags?: string[];
  /** Dimensions for images (width x height) */
  dimensions?: {
    width: number;
    height: number;
  };
  /** Duration for audio files (in seconds) */
  duration?: number;
}

/**
 * Openverse API search parameters
 * @interface
 */
export interface SearchParams {
  /** Search query string */
  query: string;
  /** Type of media to search for (default: 'image') */
  mediaType?: MediaType;
  /** Page number for pagination (default: 1) */
  page?: number;
  /** Number of results per page (default: 20, max: 50) */
  pageSize?: number;
  /** Filter by specific license(s) */
  licenses?: string[];
  /** Filter by content provider */
  provider?: string;
  /** Filter by exact tag matches */
  tags?: string[];
}

/**
 * Openverse API response structure
 * @interface
 */
interface OpenverseApiResponse {
  result_count: number;
  page_count: number;
  page_size: number;
  page: number;
  results: any[];
}

/**
 * Error class for Openverse API specific errors
 * @class
 */
export class OpenverseApiError extends Error {
  public readonly statusCode?: number;
  public readonly apiError?: any;

  constructor(message: string, statusCode?: number, apiError?: any) {
    super(message);
    this.name = 'OpenverseApiError';
    this.statusCode = statusCode;
    this.apiError = apiError;
    Object.setPrototypeOf(this, OpenverseApiError.prototype);
  }
}

/**
 * Default request configuration for axios
 */
const DEFAULT_CONFIG: AxiosRequestConfig = {
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'User-Agent': 'OpenverseClient/1.0.0'
  }
};

/**
 * Validates search parameters before making API request
 * @param params Search parameters to validate
 * @throws {Error} If validation fails
 */
function validateSearchParams(params: SearchParams): void {
  if (!params.query || params.query.trim().length === 0) {
    throw new Error('Search query cannot be empty');
  }

  if (params.pageSize && (params.pageSize < 1 || params.pageSize > 50)) {
    throw new Error('Page size must be between 1 and 50');
  }

  if (params.page && params.page < 1) {
    throw new Error('Page number must be at least 1');
  }
}

/**
 * Transforms raw API response item to OpenverseMedia format
 * @param item Raw item from API response
 * @param mediaType Type of media
 * @returns Normalized OpenverseMedia object
 */
function transformMediaItem(item: any, mediaType: MediaType): OpenverseMedia {
  return {
    id: item.id,
    title: item.title || 'Untitled',
    url: item.url,
    thumbnail: item.thumbnail || item.url,
    provider: item.provider,
    source: item.source,
    license: {
      code: item.license,
      name: item.license.toUpperCase().replace(/_/g, ' '),
      url: item.license_url
    },
    type: mediaType,
    created_date: item.created_on,
    tags: item.tags,
    ...(mediaType === 'image' && item.width && item.height ? {
      dimensions: {
        width: item.width,
        height: item.height
      }
    } : {}),
    ...(mediaType === 'audio' && item.duration ? {
      duration: item.duration
    } : {})
  };
}

/**
 * Searches the Openverse API for public domain and creative commons licensed media
 * @async
 * @function searchOpenverse
 * @param {SearchParams} params - Search parameters
 * @returns {Promise<OpenverseMedia[]>} Array of media items matching the search
 * @throws {OpenverseApiError} When API request fails
 * @example
 * const results = await searchOpenverse({
 *   query: 'nature',
 *   mediaType: 'image',
 *   licenses: ['cc0'],
 *   pageSize: 10
 * });
 */
export const searchOpenverse = async (
  params: SearchParams
): Promise<OpenverseMedia[]> => {
  try {
    validateSearchParams(params);

    const {
      query,
      mediaType = 'image',
      page = 1,
      pageSize = 20,
      licenses,
      provider,
      tags
    } = params;

    const requestParams: Record<string, any> = {
      q: query,
      page,
      page_size: pageSize
    };

    if (licenses && licenses.length > 0) {
      requestParams.license = licenses.join(',');
    }

    if (provider) {
      requestParams.provider = provider;
    }

    if (tags && tags.length > 0) {
      requestParams.tags = tags.join(',');
    }

    const response: AxiosResponse<OpenverseApiResponse> = await axios.get(
      `${BASE_URL}${mediaType}/`,
      {
        ...DEFAULT_CONFIG,
        params: requestParams
      }
    );

    if (!response.data?.results) {
      throw new OpenverseApiError('Invalid API response structure', 500);
    }

    return response.data.results.map(item => transformMediaItem(item, mediaType));
  } catch (error) {
    if (error instanceof OpenverseApiError) {
      throw error;
    }

    const axiosError = error as AxiosError;
    if (axiosError.isAxiosError) {
      throw new OpenverseApiError(
        axiosError.message,
        axiosError.response?.status,
        axiosError.response?.data
      );
    }

    throw new OpenverseApiError(
      error instanceof Error ? error.message : 'Unknown error occurred'
    );
  }
};

/**
 * Retrieves details for a specific media item by ID
 * @async
 * @function getMediaDetails
 * @param {string} id - Media item ID
 * @param {MediaType} mediaType - Type of media
 * @returns {Promise<OpenverseMedia>} Detailed media information
 * @throws {OpenverseApiError} When API request fails
 */
export const getMediaDetails = async (
  id: string,
  mediaType: MediaType
): Promise<OpenverseMedia> => {
  try {
    if (!id) {
      throw new Error('Media ID cannot be empty');
    }

    const response: AxiosResponse = await axios.get(
      `${BASE_URL}${mediaType}/${id}/`,
      DEFAULT_CONFIG
    );

    return transformMediaItem(response.data, mediaType);
  } catch (error) {
    const axiosError = error as AxiosError;
    if (axiosError.isAxiosError) {
      throw new OpenverseApiError(
        axiosError.message,
        axiosError.response?.status,
        axiosError.response?.data
      );
    }

    throw new OpenverseApiError(
      error instanceof Error ? error.message : 'Unknown error occurred'
    );
  }
};