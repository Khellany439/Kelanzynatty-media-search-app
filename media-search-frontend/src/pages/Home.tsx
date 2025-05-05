import React from 'react';
import SearchBar from '../components/Search/SearchBar';
import MediaGrid from '../components/Media/MediaGrid';

const Home: React.FC = () => {
  return (
    <div className="p-4">
      <SearchBar />
      <MediaGrid />
    </div>
  );
};

export default Home;
