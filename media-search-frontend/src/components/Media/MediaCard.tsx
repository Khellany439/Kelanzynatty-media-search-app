/**
 * @module MediaCard
 * @description 
 * Reusable card component for displaying media items with:
 * - Responsive image display
 * - Metadata presentation
 * - Accessibility compliance
 * - Interactive elements
 * 
 * @features
 * - Lazy-loaded images
 * - Hover effects
 * - Provider branding
 * - License information
 * - Type-safe props
 * 
 * @props
 * - title: Media title
 * - url: Source URL
 * - thumbnail: Preview image URL
 * - provider: Content provider
 * - license: License type (optional)
 * - creator: Content creator (optional)
 * - type: Media type (optional)
 */

import React, { useState } from 'react';
import { MediaType } from '../../types/media';

interface MediaCardProps {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  provider: string;
  license?: string;
  creator?: string;
  type?: MediaType;
  className?: string;
}

/**
 * @constant MediaCard
 * @description Displays a single media item with metadata and actions
 * 
 * @param {MediaCardProps} props - Component properties
 * @returns {React.ReactElement} Media card component
 * 
 * @state
 * - imageLoaded: Tracks image loading status
 * - isHovered: Tracks hover state for animations
 * 
 * @behavior
 * - Lazy loads images
 * - Handles image errors
 * - Provides interactive elements
 */
const MediaCard: React.FC<MediaCardProps> = ({
  id,
  title,
  url,
  thumbnail,
  provider,
  license = 'Unknown',
  creator = 'Unknown',
  type = 'image',
  className = ''
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);

  /**
   * @function handleImageClick
   * @description Handles click on media image
   * 
   * @param {React.MouseEvent} e - Click event
   */
  const handleImageClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // TODO: Implement lightbox or detail view
    console.log('View media detail:', id);
  };

  return (
    <div 
      className={`relative border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-labelledby={`media-title-${id}`}
      role="article"
    >
      {/* Image Container */}
      <div className="relative aspect-square bg-gray-100">
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
        )}
        <img
          src={imageError ? '/placeholder-media.jpg' : thumbnail}
          alt={title}
          loading="lazy"
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
          onClick={handleImageClick}
          aria-hidden="true"
        />
        
        {/* Media Type Badge */}
        <span className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
          {type.toUpperCase()}
        </span>
      </div>

      {/* Card Body */}
      <div className="p-4">
        <h3 
          id={`media-title-${id}`}
          className="font-medium text-gray-900 line-clamp-2 mb-1"
          title={title}
        >
          {title}
        </h3>
        
        {/* Metadata */}
        <div className="text-sm text-gray-600 space-y-1">
          {creator && (
            <p className="truncate">
              <span className="font-medium">Creator:</span> {creator}
            </p>
          )}
          <p className="truncate">
            <span className="font-medium">Source:</span> {provider}
          </p>
          <p className="truncate">
            <span className="font-medium">License:</span> {license}
          </p>
        </div>

        {/* Action Buttons */}
        <div className={`flex justify-between mt-3 transition-opacity ${
          isHovered ? 'opacity-100' : 'opacity-90'
        }`}>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            aria-label={`View ${title} on ${provider}`}
          >
            View Source
          </a>
          <button
            onClick={() => console.log('Save media:', id)}
            className="text-sm px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 transition-colors"
            aria-label={`Save ${title}`}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(MediaCard);