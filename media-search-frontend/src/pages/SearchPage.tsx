/**
 * @module SearchPage
 * @description 
 * Primary search interface for Openverse media with:
 * - Search input handling
 * - API integration with error states
 * - Recent searches persistence
 * - Results rendering with loading states
 * 
 * @features
 * - Typeahead search (potential enhancement)
 * - Search history for authenticated users
 * - Error boundary integration
 * 
 * @author Kelanzy
 * @created 2023-11-20
 * @version 1.3.0
 */

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../app/store";
import { searchOpenverse } from "../api/openverse";
import SearchResults from "../pages/SearchResults";
import RecentSearches from "./RecentSearches";

// -----------------------------------------------------------------------------
// Type Definitions
// -----------------------------------------------------------------------------

/**
 * @interface SearchHistoryItem
 * @description Structure for saved search history items
 * 
 * @property {string} query - The search term
 * @property {Date} timestamp - When the search was performed
 */
interface SearchHistoryItem {
  query: string;
  timestamp: Date;
}

// -----------------------------------------------------------------------------
// Component Implementation
// -----------------------------------------------------------------------------

/**
 * @function SearchPage
 * @description Main search interface component
 * 
 * @state
 * - query: Current search input
 * - mediaResults: Fetched media items
 * - loading: API request status
 * - error: Error message state
 * - recentSearches: Local storage history
 * 
 * @returns {React.ReactElement} The search interface
 * 
 * @lifecycle
 * - Loads recent searches on mount (if authenticated)
 * - Cleans up pending requests on unmount
 */
const SearchPage: React.FC = () => {
  const [query, setQuery] = useState("");
  const [mediaResults, setMediaResults] = useState<MediaResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentSearches, setRecentSearches] = useState<SearchHistoryItem[]>([]);
  const user = useSelector((state: RootState) => state.auth.user);

  /**
   * @effect LoadRecentSearches
   * @description Loads user's search history from localStorage
   */
  useEffect(() => {
    if (user?.email) {
      const saved = localStorage.getItem(`searches_${user.email}`);
      if (saved) {
        try {
          setRecentSearches(JSON.parse(saved));
        } catch (e) {
          console.error("Failed to parse search history", e);
        }
      }
    }
  }, [user]);

  /**
   * @function handleSearch
   * @description Executes media search and manages state
   * 
   * @param {React.FormEvent} e - Form submission event
   * @throws {Error} On API failure
   */
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const results = await searchOpenverse(query);
      setMediaResults(results);

      if (user?.email) {
        const newSearch = {
          query,
          timestamp: new Date()
        };
        const updatedHistory = [
          newSearch,
          ...recentSearches.slice(0, 9)
        ];
        localStorage.setItem(
          `searches_${user.email}`,
          JSON.stringify(updatedHistory)
        );
        setRecentSearches(updatedHistory);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Search failed");
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * @function handleSearchFromHistory
   * @description Re-runs search from history item
   * 
   * @param {string} pastQuery - Previously saved search term
   */
  const handleSearchFromHistory = (pastQuery: string) => {
    setQuery(pastQuery);
    // Artificial delay to allow state update before search
    setTimeout(() => {
      document.getElementById("search-form")?.requestSubmit();
    }, 50);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Page Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Openverse Media Search
        </h1>
        <p className="text-gray-600 mt-2">
          Discover CC-licensed images and audio
        </p>
      </header>

      {/* Search Form */}
      <form 
        id="search-form"
        onSubmit={handleSearch} 
        className="flex gap-4 mb-8"
        aria-label="Media search form"
      >
        <input
          type="text"
          placeholder="Search for images, audio..."
          className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search input"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className={`px-6 py-3 rounded-lg font-medium ${
            loading || !query.trim()
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
          aria-label="Submit search"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {/* Recent Searches */}
      {user && recentSearches.length > 0 && (
        <RecentSearches 
          searches={recentSearches}
          onSearch={handleSearchFromHistory}
          className="mb-8"
        />
      )}

      {/* Status Area */}
      <section aria-live="polite" aria-atomic="true">
        {loading && (
          <div className="flex items-center gap-3 text-gray-600 my-8">
            <span className="animate-spin">🌀</span>
            <span>Searching Openverse...</span>
          </div>
        )}

        {error && (
          <div 
            className="bg-red-50 border-l-4 border-red-500 p-4 mb-8"
            role="alert"
          >
            <p className="font-medium text-red-700">Search Error</p>
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {!loading && mediaResults.length === 0 && query && !error && (
          <p className="text-gray-500 my-8">
            No results found for "{query}". Try different keywords.
          </p>
        )}
      </section>

      {/* Results Display */}
      {!loading && mediaResults.length > 0 && (
        <>
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            Results for "{query}"
          </h2>
          <SearchResults 
            results={mediaResults}
            loading={loading}
            error={error}
            favorites={user?.favorites || []}
            onFavoriteToggle={user ? handleToggleFavorite : undefined}
          />
        </>
      )}
    </div>
  );
};

export default React.memo(SearchPage);