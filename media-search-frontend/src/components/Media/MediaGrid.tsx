import React from 'react';
import { useAppSelector } from '../../app/hooks';
import MediaCard from './MediaCard';

const MediaGrid: React.FC = () => {
  const media = useAppSelector((state) => state.media.items);
  const status = useAppSelector((state) => state.media.status);
  const error = useAppSelector((state) => state.media.error);

  if (status === 'loading') {
    return <p>Loading...</p>;
  }

  if (status === 'failed') {
    return <p>Error: {error}</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {media.map((item) => (
        <MediaCard
          key={item.id}
          title={item.title}
          url={item.url}
          thumbnail={item.thumbnail}
          provider={item.provider}
        />
      ))}
    </div>
  );
};

export default MediaGrid;
