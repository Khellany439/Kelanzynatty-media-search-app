import React, { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "./app/store";
import { searchMedia } from "../services/openverse";
import SearchResults from "../components/SearchResults";

const SearchPage: React.FC = () => {
  const [query, setQuery] = useState("");
  const [mediaResults, setMediaResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const user = useSelector((state: RootState) => state.auth.user);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const results = await searchMedia(query);
      setMediaResults(results.results);

      // Save to recent searches if logged in
      if (user) {
        const savedSearches = JSON.parse(
          localStorage.getItem(`searches_${user.email}`) || "[]"
        );
        localStorage.setItem(
          `searches_${user.email}`,
          JSON.stringify([query, ...savedSearches.slice(0, 9)])
        );
      }
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Search Openverse Media</h1>
      <form onSubmit={handleSearch} className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Search for images, audio..."
          className="flex-1 p-2 border border-gray-300 rounded-md"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Search
        </button>
      </form>

      {loading && <p className="text-gray-500">Loading results...</p>}

      {!loading && mediaResults.length > 0 && (
        <SearchResults results={mediaResults} />
      )}

      {!loading && mediaResults.length === 0 && (
        <p className="text-gray-400">No results yet.</p>
      )}
    </div>
  );
};

export default SearchPage;
