/**
 * @module SearchResults
 * @description 
 * Displays media search results in a responsive grid with:
 * - Multi-type rendering (images/audio)
 * - Interactive item selection
 * - Favorites management
 * - Comprehensive state handling
 * 
 * @featureFlags
 * - Responsive grid (1-4 columns)
 * - Accessibility-compliant
 * - Lazy loading
 * - Favorites highlighting
 * 
 * @author Kelanzy
 * @created 2023-11-20
 * @version 1.2.0
 */

import React from 'react';

// -----------------------------------------------------------------------------
// Type Definitions
// -----------------------------------------------------------------------------

/**
 * @interface MediaResult
 * @description Defines a media search result with licensing metadata
 * 
 * @property {string} id - Unique identifier
 * @property {string} title - Display title
 * @property {string} url - Source URL
 * @property {string} thumbnail - Preview image URL
 * @property {string} provider - Content provider
 * @property {string} source - Original collection
 * @property {string} license - License type
 * @property {string} license_url - License terms URL
 * @property {'image'|'audio'} type - Media classification
 */
type MediaResult = {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  provider: string;
  source: string;
  license: string;
  license_url: string;
  type: 'image' | 'audio';
};

/**
 * @interface Props
 * @description Component input properties
 * 
 * @property {MediaResult[]} results - Media items to display
 * @property {boolean} loading - Loading state flag
 * @property {string} error - Error message
 * @property {string[]} [favorites] - Array of favorited item IDs
 * @property {(item: MediaResult) => void} [onItemSelect] - Item click handler
 * @property {(id: string) => void} [onFavoriteToggle] - Favorite toggle handler
 */
type Props = {
  results: MediaResult[];
  loading: boolean;
  error: string;
  favorites?: string[];
  onItemSelect?: (item: MediaResult) => void;
  onFavoriteToggle?: (id: string) => void;
};

// -----------------------------------------------------------------------------
// Component Implementation
// -----------------------------------------------------------------------------

/**
 * @function SearchResults
 * @description Interactive media results grid with selection and favorites
 * 
 * @param {Props} props - Component properties
 * @returns {React.ReactElement} The rendered component
 * 
 * @stateHandling
 * - Loading/error/empty states
 * - Favorite state visualization
 * 
 * @accessibility
 * - WCAG 2.1 AA compliant
 * - Keyboard navigable
 * - ARIA labels
 * 
 * @performance
 * - Lazy-loaded images
 * - Memoized component
 * - Virtualization-ready
 */
const SearchResultsComponent: React.FC<Props> = ({
  results,
  loading,
  error,
  favorites = [],
  onItemSelect,
  onFavoriteToggle
}) => {
  // ---------------------------------------------------------------------------
  // State Handling
  // ---------------------------------------------------------------------------

  if (loading) {
    return (
      <div className="text-center mt-6 text-blue-600" role="status">
        <span className="inline-block animate-pulse">Loading results...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center mt-6 text-red-500" role="alert">
        <strong>Error:</strong> {error}
      </div>
    );
  }

  if (!results.length) {
    return (
      <div className="text-center mt-6 text-gray-600">
        No results found. Try different search terms.
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Event Handlers
  // ---------------------------------------------------------------------------

  const handleItemClick = (item: MediaResult) => {
    onItemSelect?.(item);
  };

  const handleFavoriteToggle = (
    e: React.MouseEvent,
    id: string
  ) => {
    e.stopPropagation();
    onFavoriteToggle?.(id);
  };

  // ---------------------------------------------------------------------------
  // Main Render
  // ---------------------------------------------------------------------------

  return (
    <div 
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-4"
      data-testid="search-results-grid"
      role="grid"
    >
      {results.map((item) => {
        const isFavorited = favorites.includes(item.id);
        
        return (
          <article
            key={item.id}
            className={`border rounded shadow hover:shadow-lg transition-all duration-300 bg-white ${
              onItemSelect ? 'cursor-pointer hover:border-blue-400' : ''
            }`}
            onClick={() => handleItemClick(item)}
            aria-label={`Media result: ${item.title}`}
            role="gridcell"
          >
            <div className="p-3 relative">
              {/* Favorite Toggle */}
              {onFavoriteToggle && (
                <button
                  onClick={(e) => handleFavoriteToggle(e, item.id)}
                  className={`absolute top-3 right-3 p-2 rounded-full ${
                    isFavorited 
                      ? 'text-yellow-500 hover:text-yellow-600' 
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                  aria-label={
                    isFavorited 
                      ? `Remove ${item.title} from favorites` 
                      : `Add ${item.title} to favorites`
                  }
                >
                  {isFavorited ? '★' : '☆'}
                </button>
              )}

              {/* Media Title */}
              <h3 
                className="font-semibold text-lg truncate mb-2 pr-6"
                title={item.title}
              >
                {item.title}
              </h3>

              {/* Media Preview */}
              {item.type === 'image' ? (
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="w-full h-48 object-cover rounded"
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <audio 
                  controls 
                  className="w-full mt-2"
                  aria-label={`Audio player for ${item.title}`}
                >
                  <source 
                    src={item.url} 
                    type={`audio/${item.url.split('.').pop()}`} 
                  />
                  Your browser does not support the audio element.
                </audio>
              )}

              {/* Metadata Section */}
              <div className="mt-3 text-sm text-gray-600">
                <p>
                  <span className="font-medium">Provider:</span> {item.provider}
                </p>
                
                {/* License Information */}
                <p className="mt-1">
                  <span className="font-medium">License:</span>{' '}
                  <a 
                    href={item.license_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                    aria-label={`View ${item.license} license terms`}
                  >
                    {item.license}
                  </a>
                </p>

                {/* Action Buttons */}
                <div className="flex justify-between mt-3">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-white bg-blue-600 px-3 py-1 rounded hover:bg-blue-700 transition-colors"
                    aria-label={`View original ${item.type} source`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    View Source
                  </a>
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
};

// Memoization for performance optimization
export const SearchResults = React.memo(
  SearchResultsComponent,
  (prev, next) => 
    prev.results === next.results && 
    prev.loading === next.loading && 
    prev.error === next.error &&
    prev.favorites === next.favorites
);