'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Book, RefreshCw } from 'lucide-react';

export default function RssFeedWidget() {
  const [rssItems, setRssItems] = useState([]);
  const [rssUrl, setRssUrl] = useState("https://hnrss.org/frontpage");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const rssCache = useRef(new Map());

  const defaultFeeds = [
    { name: 'Hacker News', url: 'https://hnrss.org/frontpage' },
    { name: 'Tech News', url: 'https://techcrunch.com/feed/' },
    { name: 'Reddit Programming', url: 'https://www.reddit.com/r/programming/.rss' }
  ];

  const validateUrl = (url: string) => {
    try {
      const parsedUrl = new URL(url);
      return ['http:', 'https:'].includes(parsedUrl.protocol);
    } catch {
      return false;
    }
  };

  const fetchRss = useCallback(async () => {
    if (!rssUrl) return;

    if (!validateUrl(rssUrl)) {
      setError('Please enter a valid URL starting with http:// or https://');
      return;
    }

    if (rssCache.current.has(rssUrl)) {
      setRssItems(rssCache.current.get(rssUrl));
      setError(null);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/rss?url=${encodeURIComponent(rssUrl)}`);
      if (!res.ok) throw new Error('Failed to fetch RSS feed');
      const data = await res.json();
      setRssItems(data);
      rssCache.current.set(rssUrl, data);
      setError(null);
    } catch (err) {
      console.error("RSS fetch error:", err);
      setError('Failed to load RSS feed. Please check the URL and try again.');
      setRssItems([]);
    } finally {
      setLoading(false);
    }
  }, [rssUrl]);

  useEffect(() => {
    const savedRssUrl = localStorage.getItem('rssUrl');
    if (savedRssUrl) setRssUrl(savedRssUrl);
  }, []);

  useEffect(() => {
    if (rssUrl) localStorage.setItem('rssUrl', rssUrl);
  }, [rssUrl]);

  useEffect(() => {
    const timeoutId = setTimeout(fetchRss, 100);
    return () => clearTimeout(timeoutId);
  }, [fetchRss]);

  return (
    <div className="mt-12 max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <Book className="w-5 h-5 mr-2 text-red-600" />
          RSS Feed
        </h2>

        {/* Feed Selector */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select a feed:
          </label>
          <select
            value={rssUrl}
            onChange={(e) => setRssUrl(e.target.value)}
            className="w-full border border-gray-300 text-gray-800 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            {defaultFeeds.map(feed => (
              <option key={feed.url} value={feed.url}>
                {feed.name}
              </option>
            ))}
            <option value={rssUrl}>Custom URL</option>
          </select>
        </div>

        {/* Custom URL input */}
        <div className="flex mb-4">
          <input
            type="text"
            value={rssUrl}
            onChange={(e) => setRssUrl(e.target.value)}
            placeholder="Enter RSS feed URL..."
            className="flex-1 border border-gray-300 rounded-l-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            aria-label="RSS feed URL"
          />
          <button
            onClick={fetchRss}
            disabled={loading}
            className="bg-indigo-600 text-white px-4 py-2 rounded-r-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center"
            aria-label="Load RSS feed"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Load'}
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="text-red-500 text-sm mb-4 p-2 bg-red-50 rounded-md">
            {error}
          </div>
        )}

        {/* Feed items */}
        {loading ? (
          <div className="text-center py-8">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-indigo-600" />
            <p className="text-gray-500 mt-2">Loading feed...</p>
          </div>
        ) : rssItems.length > 0 ? (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {rssItems.slice(0, 10).map((item: any, i: number) => (
              <div
                key={i}
                className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition"
              >
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 font-medium hover:underline block mb-1"
                >
                  {item.title}
                </a>
                {item.content && (
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                    {item.content.replace(/<[^>]*>/g, '')}
                  </p>
                )}
                <div className="text-xs text-gray-500">
                  {item.pubDate && new Date(item.pubDate).toLocaleDateString()}
                </div>
              </div>
            ))}
            {rssItems.length > 10 && (
              <p className="text-center text-sm text-gray-500 mt-4">
                Showing 10 of {rssItems.length} items
              </p>
            )}
          </div>
        ) : (
          !error && <p className="text-gray-500 text-center py-4">No feed items available</p>
        )}
      </div>
    </div>
  );
}
