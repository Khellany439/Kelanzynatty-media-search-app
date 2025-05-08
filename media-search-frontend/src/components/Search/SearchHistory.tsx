import React from 'react';

type SearchHistoryProps = {
  searches: string[];
  onSearch: (query: string) => void;
  isOpen: boolean;
  onToggle: () => void;
};

const SearchHistory: React.FC<SearchHistoryProps> = ({
  searches,
  onSearch,
  isOpen,
  onToggle
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-medium">Search History</h3>
        <button 
          onClick={onToggle}
          className="text-blue-600 text-sm"
        >
          {isOpen ? 'Hide' : 'Show'}
        </button>
      </div>
      
      {isOpen && (
        <ul className="space-y-2">
          {searches.length > 0 ? (
            searches.map((search, index) => (
              <li key={index}>
                <button
                  onClick={() => onSearch(search)}
                  className="text-left w-full hover:bg-gray-100 p-2 rounded text-sm"
                >
                  {search}
                </button>
              </li>
            ))
          ) : (
            <p className="text-gray-500 text-sm">No search history yet</p>
          )}
        </ul>
      )}
    </div>
  );
};

export default SearchHistory;