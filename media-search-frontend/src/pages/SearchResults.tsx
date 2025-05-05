import React from 'react';

type MediaResult = {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  provider: string;
  source: string;
  license: string;
  license_url: string;
  type: 'image' | 'audio';
};

type Props = {
  results: MediaResult[];
  loading: boolean;
  error: string;
};

const SearchResults: React.FC<Props> = ({ results, loading, error }) => {
  if (loading) {
    return <p className="text-center mt-6 text-blue-600">Loading results...</p>;
  }

  if (error) {
    return <p className="text-center mt-6 text-red-500">Error: {error}</p>;
  }

  if (!results.length) {
    return <p className="text-center mt-6 text-gray-600">No results found.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-4">
      {results.map((item) => (
        <div
          key={item.id}
          className="border rounded shadow hover:shadow-lg transition duration-300 bg-white"
        >
          <div className="p-3">
            <h3 className="font-semibold text-lg truncate mb-2">{item.title}</h3>

            {item.type === 'image' ? (
              <img
                src={item.thumbnail}
                alt={item.title}
                className="w-full h-48 object-cover rounded"
              />
            ) : (
              <audio controls className="w-full mt-2">
                <source src={item.url} />
                Your browser does not support the audio element.
              </audio>
            )}

            <div className="mt-3 text-sm text-gray-600">
              <p>Provider: {item.provider}</p>
              <p>License: <a href={item.license_url} target="_blank" rel="noopener noreferrer" className="text-blue-600">{item.license}</a></p>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-2 text-sm text-white bg-blue-600 px-3 py-1 rounded hover:bg-blue-700"
              >
                View Original
              </a>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SearchResults;
