/**
 * @module MediaGrid
 * @description 
 * Responsive grid layout for displaying media items with:
 * - Adaptive column count
 * - Loading and error states
 * - Empty state handling
 * - Performance optimizations
 * 
 * @features
 * - Responsive grid (1-3 columns)
 * - Loading skeletons
 * - Error boundary
 * - Accessibility compliance
 * 
 * @dependencies
 * - react-redux: State management
 * - ./MediaCard: Individual media item component
 */

import React from 'react';
import { useAppSelector } from '../../app/hooks';
import MediaCard from './MediaCard';
import SkeletonLoader from '../UI/SkeletonLoader';
import ErrorBoundary from '../Error/ErrorBoundary';

/**
 * @constant GRID_CONFIG
 * @description Configuration for responsive grid layout
 * 
 * @property {Object} breakpoints - Screen size breakpoints
 * @property {number} columns - Columns per breakpoint
 */
const GRID_CONFIG = {
  breakpoints: {
    sm: 640,
    md: 768,
    lg: 1024
  },
  columns: {
    base: 1,
    sm: 2,
    md: 3
  }
};

/**
 * @function MediaGrid
 * @description Displays media items in responsive grid layout
 * 
 * @state
 * - media: Array of media items from Redux store
 * - status: Loading state from Redux
 * - error: Error message from Redux
 * 
 * @returns {React.ReactElement} Responsive media grid
 */
const MediaGrid: React.FC = () => {
  const { items: media, status, error } = useAppSelector((state) => state.media);
  const isLoading = status === 'loading';
  const hasError = status === 'failed';
  const isEmpty = !isLoading && media.length === 0;

  /**
   * @function renderLoadingSkeletons
   * @description Renders placeholder loading skeletons
   * 
   * @returns {React.ReactNode[]} Array of skeleton loaders
   */
  const renderLoadingSkeletons = () => {
    return Array.from({ length: 6 }).map((_, index) => (
      <SkeletonLoader 
        key={`skeleton-${index}`}
        className="h-64 w-full"
      />
    ));
  };

  return (
    <ErrorBoundary fallback={<div className="text-red-500 p-4">Media grid failed to load</div>}>
      <div 
        className={`grid gap-6 ${
          `grid-cols-${GRID_CONFIG.columns.base} ` +
          `sm:grid-cols-${GRID_CONFIG.columns.sm} ` +
          `md:grid-cols-${GRID_CONFIG.columns.md}`
        }`}
        role="grid"
        aria-busy={isLoading}
        aria-live="polite"
      >
        {/* Loading State */}
        {isLoading && renderLoadingSkeletons()}

        {/* Error State */}
        {hasError && (
          <div 
            className="col-span-full p-4 bg-red-50 border-l-4 border-red-500"
            role="alert"
          >
            <h3 className="font-medium text-red-800">Error loading media</h3>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {isEmpty && (
          <div className="col-span-full text-center py-12">
            <h3 className="text-lg font-medium text-gray-600">No media found</h3>
            <p className="text-gray-500 mt-2">Try adjusting your search filters</p>
          </div>
        )}

        {/* Success State */}
        {!isLoading && !hasError && media.map((item) => (
          <MediaCard
            key={item.id}
            id={item.id}
            title={item.title}
            url={item.url}
            thumbnail={item.thumbnail}
            provider={item.provider}
            license={item.license}
            creator={item.creator}
            type={item.type}
          />
        ))}
      </div>
    </ErrorBoundary>
  );
};

export default React.memo(MediaGrid);