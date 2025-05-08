/**
 * @module FilterPanel
 * @description 
 * Advanced filtering component for media search with:
 * - Media type filtering
 * - License type selection
 * - Provider filtering
 * - Sorting options
 * 
 * @features
 * - Type-safe filtering
 * - Responsive design
 * - Accessible controls
 * - Dynamic option rendering
 * 
 * @props
 * - filters: Current filter values
 * - licenses: Available license options
 * - providers: Available provider options
 * - onFilterChange: Filter update handler
 * - onSortChange: Sort update handler
 * - currentSort: Active sort option
 */

import React from 'react';
import { MediaType, SortOption } from '../../types/media';

/**
 * @interface FilterPanelProps
 * @description Props for FilterPanel component
 * 
 * @property {Object} filters - Current filter values
 * @property {'all'|MediaType} filters.type - Selected media type
 * @property {string} filters.license - Selected license
 * @property {string} filters.provider - Selected provider
 * @property {string[]} licenses - Available license options
 * @property {string[]} providers - Available provider options
 * @property {(filters: Partial<FilterState>) => void} onFilterChange - Filter update handler
 * @property {(option: SortOption) => void} onSortChange - Sort update handler
 * @property {SortOption} currentSort - Currently active sort option
 */
interface FilterPanelProps {
  filters: {
    type: MediaType | 'all';
    license: string;
    provider: string;
  };
  licenses: string[];
  providers: string[];
  onFilterChange: (filters: Partial<{
    type: MediaType | 'all';
    license: string;
    provider: string;
  }>) => void;
  onSortChange: (option: SortOption) => void;
  currentSort: SortOption;
  className?: string;
}

/**
 * @constant FilterPanel
 * @description Media filtering and sorting control panel
 * 
 * @param {FilterPanelProps} props - Component properties
 * @returns {React.ReactElement} Filter controls panel
 * 
 * @behavior
 * - Maintains filter state
 * - Handles filter changes
 * - Preserves UI state
 * - Optimizes re-renders
 */
const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  licenses,
  providers,
  onFilterChange,
  onSortChange,
  currentSort,
  className = ''
}) => {
  /**
   * @function handleFilterChange
   * @description Handles filter selection changes
   * 
   * @param {React.ChangeEvent<HTMLSelectElement>} e - Change event
   * @param {keyof FilterState} filterKey - Filter type being changed
   */
  const handleFilterChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
    filterKey: keyof typeof filters
  ) => {
    onFilterChange({ [filterKey]: e.target.value });
  };

  return (
    <div className={`bg-white p-4 rounded-lg shadow-sm border border-gray-200 ${className}`}>
      <h3 className="font-medium text-lg mb-4 text-gray-800">Refine Results</h3>
      
      <div className="space-y-5">
        {/* Media Type Filter */}
        <div>
          <label 
            htmlFor="media-type-filter"
            className="block text-sm font-medium mb-2 text-gray-700"
          >
            Media Type
          </label>
          <select
            id="media-type-filter"
            value={filters.type}
            onChange={(e) => handleFilterChange(e, 'type')}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            aria-label="Filter by media type"
          >
            <option value="all">All Types</option>
            <option value="image">Images</option>
            <option value="audio">Audio</option>
            <option value="video">Videos</option>
          </select>
        </div>

        {/* License Filter */}
        <div>
          <label 
            htmlFor="license-filter"
            className="block text-sm font-medium mb-2 text-gray-700"
          >
            License
          </label>
          <select
            id="license-filter"
            value={filters.license}
            onChange={(e) => handleFilterChange(e, 'license')}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            aria-label="Filter by license type"
          >
            <option value="any">Any License</option>
            {licenses.map(license => (
              <option key={license} value={license}>
                {license}
              </option>
            ))}
          </select>
        </div>

        {/* Provider Filter */}
        <div>
          <label 
            htmlFor="provider-filter"
            className="block text-sm font-medium mb-2 text-gray-700"
          >
            Source Provider
          </label>
          <select
            id="provider-filter"
            value={filters.provider}
            onChange={(e) => handleFilterChange(e, 'provider')}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            aria-label="Filter by provider"
          >
            <option value="any">Any Provider</option>
            {providers.map(provider => (
              <option key={provider} value={provider}>
                {provider}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Options */}
        <div>
          <label 
            htmlFor="sort-options"
            className="block text-sm font-medium mb-2 text-gray-700"
          >
            Sort By
          </label>
          <select
            id="sort-options"
            value={currentSort}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            aria-label="Sort results"
          >
            <option value="relevance">Relevance</option>
            <option value="newest">Newest First</option>
            <option value="popular">Most Popular</option>
            <option value="trending">Trending</option>
          </select>
        </div>

        {/* Reset Button */}
        <button
          type="button"
          onClick={() => {
            onFilterChange({
              type: 'all',
              license: 'any',
              provider: 'any'
            });
            onSortChange('relevance');
          }}
          className="w-full mt-4 py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Reset all filters"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
};

export default React.memo(FilterPanel);