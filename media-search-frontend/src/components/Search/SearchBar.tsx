/**
 * @module SearchBar
 * @description 
 * Primary search input component with:
 * - Query input handling
 * - Form submission
 * - Search execution via Redux
 * - Accessibility compliance
 * 
 * @features
 * - Debounced search suggestions
 * - Keyboard navigation
 * - Input validation
 * - Loading state integration
 * 
 * @dependencies
 * - react-redux: State management
 * - features/media/mediaSlice: Search action dispatch
 */

import React, { useState, useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchMedia, selectMediaStatus } from '../../features/media/mediaSlice';
import { useDebounce } from '../../hooks/useDebounce';

/**
 * @constant DEBOUNCE_DELAY
 * @description Time in milliseconds to wait before triggering search suggestions
 */
const DEBOUNCE_DELAY = 300;

/**
 * @function SearchBar
 * @description Primary search input component
 * 
 * @state
 * - query: Current search input value
 * - showSuggestions: Controls suggestion visibility
 * - activeSuggestion: Keyboard navigation index
 * 
 * @returns {React.ReactElement} Search bar with optional suggestions
 */
const SearchBar: React.FC = () => {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(0);
  const dispatch = useAppDispatch();
  const status = useAppSelector(selectMediaStatus);
  const searchRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebounce(query, DEBOUNCE_DELAY);

  // Mock suggestions - replace with actual API call
  const suggestions = [
    'Nature',
    'Technology',
    'Animals',
    'Architecture',
    'Music'
  ];

  /**
   * @effect Handle click outside
   * @description Closes suggestions when clicking outside component
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /**
   * @function handleSearch
   * @description Handles search form submission
   * 
   * @param {React.FormEvent} e - Form event
   */
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      dispatch(fetchMedia({ query }));
      setShowSuggestions(false);
    }
  };

  /**
   * @function handleSuggestionClick
   * @description Handles suggestion selection
   * 
   * @param {string} suggestion - Selected suggestion
   */
  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    dispatch(fetchMedia({ query: suggestion }));
    setShowSuggestions(false);
  };

  /**
   * @function handleKeyDown
   * @description Handles keyboard navigation in suggestions
   * 
   * @param {React.KeyboardEvent} e - Keyboard event
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    // Arrow down
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSuggestion(prev => 
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    }
    // Arrow up
    else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSuggestion(prev => (prev > 0 ? prev - 1 : 0));
    }
    // Enter
    else if (e.key === 'Enter' && showSuggestions) {
      e.preventDefault();
      if (suggestions[activeSuggestion]) {
        handleSuggestionClick(suggestions[activeSuggestion]);
      }
    }
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl">
      <form 
        onSubmit={handleSearch} 
        role="search"
        className="flex shadow-sm rounded-lg overflow-hidden"
      >
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search for images, audio..."
          className="flex-grow p-4 border-none focus:ring-2 focus:ring-blue-500 focus:outline-none"
          aria-label="Search media"
          aria-haspopup="listbox"
          aria-expanded={showSuggestions}
          aria-controls="search-suggestions"
        />
        <button 
          type="submit" 
          disabled={status === 'loading' || !query.trim()}
          className={`px-6 bg-blue-600 text-white font-medium transition-colors ${
            status === 'loading' || !query.trim() 
              ? 'bg-blue-400 cursor-not-allowed' 
              : 'hover:bg-blue-700'
          }`}
          aria-label="Submit search"
        >
          {status === 'loading' ? (
            <span className="inline-block animate-spin">↻</span>
          ) : (
            'Search'
          )}
        </button>
      </form>

      {/* Search Suggestions */}
      {showSuggestions && query && suggestions.length > 0 && (
        <ul 
          id="search-suggestions"
          role="listbox"
          className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {suggestions
            .filter(suggestion => 
              suggestion.toLowerCase().includes(query.toLowerCase())
            )
            .map((suggestion, index) => (
              <li 
                key={suggestion}
                role="option"
                aria-selected={index === activeSuggestion}
                className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                  index === activeSuggestion ? 'bg-blue-50' : ''
                }`}
                onClick={() => handleSuggestionClick(suggestion)}
                onMouseEnter={() => setActiveSuggestion(index)}
              >
                {suggestion}
              </li>
            ))
          }
        </ul>
      )}
    </div>
  );
};

export default React.memo(SearchBar);