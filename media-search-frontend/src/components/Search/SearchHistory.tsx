/**
 * @module SearchHistory
 * @description 
 * Displays and manages user's search history with:
 * - Toggleable visibility
 * - Click-to-search functionality
 * - Empty state handling
 * - LocalStorage persistence (handled by parent)
 * 
 * @features
 * - Keyboard navigable
 * - Accessibility compliant
 * - Responsive design
 * - Performance optimized
 * 
 * @props
 * - searches: Array of past search queries
 * - onSearch: Handler for search selection
 * - isOpen: Controls component visibility
 * - onToggle: Toggle visibility handler
 */

import React, { useCallback, useEffect } from 'react';

/**
 * @interface SearchHistoryProps
 * @description Props for SearchHistory component
 * 
 * @property {string[]} searches - Array of past search queries
 * @property {(query: string) => void} onSearch - Handler for search selection
 * @property {boolean} isOpen - Controls component visibility
 * @property {() => void} onToggle - Toggle visibility handler
 */
interface SearchHistoryProps {
  searches: string[];
  onSearch: (query: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  maxItems?: number;
  onClear?: () => void;
}

/**
 * @function SearchHistory
 * @description Interactive search history component
 * 
 * @param {SearchHistoryProps} props - Component properties
 * @returns {React.ReactElement} Search history panel
 * 
 * @behavior
 * - Manages keyboard navigation
 * - Limits displayed items
 * - Handles empty state
 * - Optimizes re-renders
 */
const SearchHistory: React.FC<SearchHistoryProps> = ({
  searches,
  onSearch,
  isOpen,
  onToggle,
  maxItems = 10,
  onClear
}) => {
  /**
   * @function handleKeyDown
   * @description Handles keyboard navigation
   * 
   * @param {React.KeyboardEvent} e - Keyboard event
   * @param {string} query - Search query
   */
  const handleKeyDown = useCallback((e: React.KeyboardEvent, query: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSearch(query);
    }
  }, [onSearch]);

  // Close when clicking outside (example implementation)
  useEffect(() => {
    if (!isOpen) return;
    
    const handleClickOutside = () => {
      // Implementation would require ref to component
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Memoize displayed searches to prevent unnecessary re-renders
  const displayedSearches = useMemo(() => 
    searches.slice(0, maxItems), 
    [searches, maxItems]
  );

  return (
    <div 
      className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
      aria-expanded={isOpen}
      role="region"
      aria-label="Search history"
    >
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-medium text-gray-800">Search History</h3>
        <div className="flex items-center gap-2">
          {onClear && searches.length > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
              className="text-xs text-red-600 hover:text-red-800"
              aria-label="Clear all search history"
            >
              Clear All
            </button>
          )}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            className="text-blue-600 text-sm hover:text-blue-800 focus:outline-none"
            aria-expanded={isOpen}
            aria-controls="search-history-list"
          >
            {isOpen ? 'Hide' : 'Show'}
          </button>
        </div>
      </div>
      
      {isOpen && (
        <ul 
          id="search-history-list"
          className="space-y-1 max-h-60 overflow-y-auto"
          role="list"
        >
          {displayedSearches.length > 0 ? (
            displayedSearches.map((search, index) => (
              <li key={`${search}-${index}`} role="listitem">
                <button
                  onClick={() => onSearch(search)}
                  onKeyDown={(e) => handleKeyDown(e, search)}
                  className="w-full text-left hover:bg-gray-100 p-2 rounded text-sm flex items-center justify-between group"
                  tabIndex={0}
                  aria-label={`Search for ${search}`}
                >
                  <span className="truncate">{search}</span>
                  <span 
                    className="opacity-0 group-hover:opacity-100 text-gray-400 text-xs"
                    aria-hidden="true"
                  >
                    ↵
                  </span>
                </button>
              </li>
            ))
          ) : (
            <li className="text-center py-4">
              <p className="text-gray-500 text-sm">No search history yet</p>
            </li>
          )}
        </ul>
      )}
    </div>
  );
};

export default React.memo(SearchHistory);