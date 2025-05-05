import React from 'react';

interface MediaCardProps {
  title: string;
  url: string;
  thumbnail: string;
  provider: string;
}

const MediaCard: React.FC<MediaCardProps> = ({ title, url, thumbnail, provider }) => {
  return (
    <div className="border p-4">
      <img src={thumbnail} alt={title} className="w-full h-48 object-cover" />
      <h3 className="mt-2 text-lg font-semibold">{title}</h3>
      <p className="text-sm text-gray-500">Provider: {provider}</p>
      <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-500">
        View
      </a>
    </div>
  );
};

export default MediaCard;
