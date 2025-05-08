/**
 * @module Pagination
 * @description 
 * A reusable pagination component that provides navigation controls for large datasets.
 * 
 * @features
 * - Page number navigation
 * - Previous/next buttons
 * - Current page highlighting
 * - Responsive design
 * - Accessibility compliant
 * 
 * @props
 * - currentPage: Currently active page (1-indexed)
 * - totalPages: Total number of available pages
 * - onPageChange: Callback when page changes
 * - className: Optional container class
 * 
 * @accessibility
 * - ARIA labels for navigation
 * - Keyboard navigable
 * - Disabled state indicators
 */

import React, { useMemo } from 'react';

/**
 * @type PaginationProps
 * @description Props for the Pagination component
 * 
 * @property {number} currentPage - Currently active page (1-indexed)
 * @property {number} totalPages - Total number of available pages
 * @property {(page: number) => void} onPageChange - Page change handler
 * @property {string} [className] - Optional CSS class for the container
 */
type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
  maxVisiblePages?: number; // New prop for pagination window
};

/**
 * @constant Pagination
 * @description Pagination navigation component
 * 
 * @param {PaginationProps} props - Component properties
 * @returns {React.ReactElement} Pagination controls
 * 
 * @behavior
 * - Generates page range based on current position
 * - Handles edge cases (first/last page)
 * - Optimizes re-renders with useMemo
 */
const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
  maxVisiblePages = 5
}) => {
  /**
   * @function getVisiblePages
   * @description Calculates the range of visible page numbers
   * 
   * @returns {number[]} Array of visible page numbers
   */
  const visiblePages = useMemo(() => {
    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const half = Math.floor(maxVisiblePages / 2);
    let start = Math.max(1, currentPage - half);
    const end = Math.min(totalPages, start + maxVisiblePages - 1);

    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(1, end - maxVisiblePages + 1);
    }

    return Array.from(
      { length: Math.min(maxVisiblePages, totalPages) },
      (_, i) => start + i
    );
  }, [currentPage, totalPages, maxVisiblePages]);

  /**
   * @function handlePageChange
   * @description Page change handler with validation
   * 
   * @param {number} page - Target page number
   */
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  // Don't render if no pages available
  if (totalPages <= 1) return null;

  return (
    <div 
      className={`flex justify-center ${className}`}
      role="navigation"
      aria-label="Pagination"
    >
      <nav className="flex items-center gap-1">
        {/* Previous Page Button */}
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50 hover:bg-gray-50 transition-colors"
          aria-label="Previous page"
        >
          &lt;
        </button>

        {/* First Page (when not in visible range) */}
        {!visiblePages.includes(1) && (
          <>
            <button
              onClick={() => handlePageChange(1)}
              className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              1
            </button>
            {visiblePages[0] > 2 && (
              <span className="px-2">...</span>
            )}
          </>
        )}

        {/* Visible Page Numbers */}
        {visiblePages.map(page => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`px-3 py-1 rounded border transition-colors ${
              page === currentPage 
                ? 'bg-blue-600 text-white border-blue-600' 
                : 'border-gray-300 hover:bg-gray-50'
            }`}
            aria-current={page === currentPage ? 'page' : undefined}
          >
            {page}
          </button>
        ))}

        {/* Last Page (when not in visible range) */}
        {!visiblePages.includes(totalPages) && (
          <>
            {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
              <span className="px-2">...</span>
            )}
            <button
              onClick={() => handlePageChange(totalPages)}
              className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              {totalPages}
            </button>
          </>
        )}

        {/* Next Page Button */}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50 hover:bg-gray-50 transition-colors"
          aria-label="Next page"
        >
          &gt;
        </button>
      </nav>
    </div>
  );
};

export default React.memo(Pagination);