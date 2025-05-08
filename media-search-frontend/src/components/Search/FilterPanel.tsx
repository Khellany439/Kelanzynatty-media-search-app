import React from 'react';
import { MediaType, SortOption } from '../../types/media';

type FilterPanelProps = {
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
};

const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  licenses,
  providers,
  onFilterChange,
  onSortChange,
  currentSort
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <h3 className="font-medium mb-4">Filters</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Media Type</label>
          <select
            value={filters.type}
            onChange={(e) => onFilterChange({ type: e.target.value as MediaType | 'all' })}
            className="w-full p-2 border rounded"
          >
            <option value="all">All Types</option>
            <option value="image">Images</option>
            <option value="audio">Audio</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">License</label>
          <select
            value={filters.license}
            onChange={(e) => onFilterChange({ license: e.target.value })}
            className="w-full p-2 border rounded"
          >
            <option value="any">Any License</option>
            {licenses.map(license => (
              <option key={license} value={license}>{license}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Provider</label>
          <select
            value={filters.provider}
            onChange={(e) => onFilterChange({ provider: e.target.value })}
            className="w-full p-2 border rounded"
          >
            <option value="any">Any Provider</option>
            {providers.map(provider => (
              <option key={provider} value={provider}>{provider}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Sort By</label>
          <select
            value={currentSort}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="w-full p-2 border rounded"
          >
            <option value="relevance">Relevance</option>
            <option value="newest">Newest</option>
            <option value="popular">Most Popular</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;