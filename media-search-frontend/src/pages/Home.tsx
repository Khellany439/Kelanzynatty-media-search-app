/**
 * @module Home
 * @description 
 * Primary application landing page with advanced features:
 * - Search with history
 * - Paginated media results
 * - Filtering and sorting
 * - Performance optimizations
 * - Comprehensive error handling
 * 
 * @features
 * - Search bar with suggestions
 * - Media grid with pagination
 * - Filter/sort controls
 * - Search history panel
 * - Memoized components
 * - Error boundaries
 * 
 * @author Kelanzy
 * @created 2023-11-20
 * @version 2.0.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import SearchBar from '../components/Search/SearchBar';
import MediaGrid from '../components/Media/MediaGrid';
import EmptyState from '../components/UI/EmptyState';
import ErrorBoundary from '../components/Error/ErrorBoundary';
import Pagination from '../components/UI/Pagination';
import FilterPanel from '../components/Search/FilterPanel';
import SearchHistory from '../components/Search/SearchHistory';
import { MediaResult, MediaType, SortOption } from '../types/media';
import { useDebounce } from '../hooks/useDebounce';
import { useLocalStorage } from '../hooks/useLocalStorage';

// Mock API service (replace with actual API calls)
const mockSearchAPI = {
  search: async (
    query: string, 
    page: number, 
    filters: Filters,
    sort: SortOption
  ): Promise<{ results: MediaResult[]; total: number }> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const itemsPerPage = 12;
    const allResults = generateMockResults(query, 100);
    const filtered = applyFilters(allResults, filters);
    const sorted = sortResults(filtered, sort);
    const paginated = sorted.slice((page - 1) * itemsPerPage, page * itemsPerPage);
    return { results: paginated, total: sorted.length };
  }
};

type Filters = {
  type: MediaType | 'all';
  license: string;
  provider: string;
};

const Home: React.FC = () => {
  // ---------------------------------------------------------------------------
  // State Management
  // ---------------------------------------------------------------------------
  const [searchQuery, setSearchQuery] = useState('');
  const [mediaResults, setMediaResults] = useState<MediaResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [filters, setFilters] = useState<Filters>({
    type: 'all',
    license: 'any',
    provider: 'any'
  });
  const [sortOption, setSortOption] = useState<SortOption>('relevance');
  const [searchHistory, setSearchHistory] = useLocalStorage<string[]>('searchHistory', []);
  const [showHistory, setShowHistory] = useState(false);

  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const itemsPerPage = 12;

  // ---------------------------------------------------------------------------
  // Derived Values
  // ---------------------------------------------------------------------------
  const totalPages = useMemo(() => Math.ceil(totalResults / itemsPerPage), [totalResults]);
  const availableLicenses = useMemo(() => 
    Array.from(new Set(mediaResults.map(item => item.license))), 
    [mediaResults]
  );
  const availableProviders = useMemo(() => 
    Array.from(new Set(mediaResults.map(item => item.provider))), 
    [mediaResults]
  );

  // ---------------------------------------------------------------------------
  // Search Handlers
  // ---------------------------------------------------------------------------
  const handleSearch = useCallback(async (query: string, page: number = 1) => {
    if (!query.trim()) {
      setMediaResults([]);
      setTotalResults(0);
      return;
    }

    setIsLoading(true);
    setError(null);
    setCurrentPage(page);

    try {
      const { results, total } = await mockSearchAPI.search(
        query,
        page,
        filters,
        sortOption
      );

      setMediaResults(results);
      setTotalResults(total);
      
      // Update search history
      if (!searchHistory.includes(query)) {
        setSearchHistory(prev => [query, ...prev].slice(0, 10));
      }
    } catch (err) {
      setError('Failed to load media results');
      console.error('Search error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filters, sortOption, searchHistory, setSearchHistory]);

  const handleFilterChange = useCallback((newFilters: Partial<Filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  }, []);

  const handleSortChange = useCallback((option: SortOption) => {
    setSortOption(option);
    setCurrentPage(1);
  }, []);

  // ---------------------------------------------------------------------------
  // Effects
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (debouncedSearchQuery) {
      handleSearch(debouncedSearchQuery, currentPage);
    }
  }, [debouncedSearchQuery, currentPage, filters, sortOption, handleSearch]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="p-4 max-w-7xl mx-auto">
      <ErrorBoundary fallback={<div className="text-red-500 p-4">Component failed to render</div>}>
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-1/4 space-y-6">
            <SearchHistory 
              searches={searchHistory}
              onSearch={query => {
                setSearchQuery(query);
                setShowHistory(false);
              }}
              isOpen={showHistory}
              onToggle={() => setShowHistory(!showHistory)}
            />

            <FilterPanel
              filters={filters}
              licenses={availableLicenses}
              providers={availableProviders}
              onFilterChange={handleFilterChange}
              onSortChange={handleSortChange}
              currentSort={sortOption}
            />
          </aside>

          {/* Main Content */}
          <main className="lg:w-3/4">
            <section aria-labelledby="search-heading" className="mb-8">
              <h2 id="search-heading" className="sr-only">Media Search</h2>
              <SearchBar 
                value={searchQuery}
                onChange={setSearchQuery}
                onSearch={handleSearch}
                isLoading={isLoading}
                showSuggestions
                onFocus={() => setShowHistory(true)}
              />
            </section>

            <section aria-labelledby="results-heading" className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 id="results-heading" className="text-xl font-semibold">
                  {searchQuery ? `Results for "${searchQuery}"` : 'Popular Media'}
                </h2>
                {totalResults > 0 && (
                  <span className="text-gray-600">
                    {totalResults} {totalResults === 1 ? 'result' : 'results'}
                  </span>
                )}
              </div>

              {error ? (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                  <p className="font-medium text-red-700">Error</p>
                  <p className="text-red-600">{error}</p>
                </div>
              ) : isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : mediaResults.length > 0 ? (
                <>
                  <MediaGrid 
                    items={mediaResults} 
                    searchQuery={searchQuery}
                  />
                  {totalPages > 1 && (
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={page => {
                        setCurrentPage(page);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="mt-8"
                    />
                  )}
                </>
              ) : (
                <EmptyState 
                  title={searchQuery ? "No results found" : "Search for media"}
                  description={searchQuery 
                    ? `Try different keywords or filters for "${searchQuery}"` 
                    : "Enter a search term to discover media"}
                  icon="search"
                />
              )}
            </section>
          </main>
        </div>
      </ErrorBoundary>
    </div>
  );
};

// Helper functions
function generateMockResults(query: string, count: number): MediaResult[] {
  if (!query) return [];
  
  return Array.from({ length: count }, (_, i) => ({
    id: `mock-${i}`,
    title: `${query} result ${i + 1}`,
    url: `https://example.com/${query}-${i}`,
    thumbnail: `https://picsum.photos/300/200?random=${i}`,
    provider: ['Wikimedia', 'Flickr', 'Openverse'][i % 3],
    source: ['User Upload', 'API Import', 'Community'][i % 3],
    license: ['CC BY 4.0', 'CC BY-SA 4.0', 'Public Domain'][i % 3],
    license_url: 'https://creativecommons.org/licenses/by/4.0/',
    type: i % 2 === 0 ? 'image' : 'audio',
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    views: Math.floor(Math.random() * 10000)
  }));
}

function applyFilters(results: MediaResult[], filters: Filters): MediaResult[] {
  return results.filter(item => {
    const typeMatch = filters.type === 'all' || item.type === filters.type;
    const licenseMatch = filters.license === 'any' || item.license === filters.license;
    const providerMatch = filters.provider === 'any' || item.provider === filters.provider;
    return typeMatch && licenseMatch && providerMatch;
  });
}

function sortResults(results: MediaResult[], sort: SortOption): MediaResult[] {
  const copy = [...results];
  switch (sort) {
    case 'newest':
      return copy.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    case 'popular':
      return copy.sort((a, b) => b.views - a.views);
    case 'relevance':
    default:
      return copy;
  }
}

export default React.memo(Home);