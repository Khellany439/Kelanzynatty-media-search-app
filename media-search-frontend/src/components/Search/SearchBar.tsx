import React, { useState } from 'react';
import { useAppDispatch } from '../../app/hooks';
import { fetchMedia } from '../../features/media/mediaSlice';

const SearchBar: React.FC = () => {
  const [query, setQuery] = useState('');
  const dispatch = useAppDispatch();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      dispatch(fetchMedia(query));
    }
  };

  return (
    <form onSubmit={handleSearch} className="flex">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search media..."
        className="border p-2 flex-grow"
      />
      <button type="submit" className="bg-blue-500 text-white p-2">
        Search
      </button>
    </form>
  );
};

export default SearchBar;
