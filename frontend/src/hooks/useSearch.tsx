// src/hooks/useSearch.tsx
import { useState, useEffect, useCallback } from "react";

export interface SearchResult {
  id: string;
  title: string;
  snippet?: string;
  score?: number;
  [key: string]: any;
}

interface UseSearchReturn {
  results: SearchResult[];
  loading: boolean;
  error: string | null;
  search: (query: string) => void;
  clearResults: () => void;
}

/**
 * Custom hook for performing search queries with API call.
 * @param apiEndpoint The backend search API endpoint URL
 */
export function useSearch(apiEndpoint: string): UseSearchReturn {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const search = useCallback((q: string) => {
    setQuery(q);
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
    setQuery("");
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    // Add timeout for better UX
    const controller = new AbortController();
    
    fetch(`${apiEndpoint}?q=${encodeURIComponent(query.trim())}`, {
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(errorText || "Search API error");
        }
        return res.json();
      })
      .then((data) => {
        if (!cancelled) {
          setResults(data.results || []);
        }
      })
      .catch((err: Error) => {
        if (!cancelled && err.name !== 'AbortError') {
          setError(err.message || "Failed to fetch search results");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [apiEndpoint, query]);

  return { 
    results, 
    loading, 
    error, 
    search, 
    clearResults 
  };
}

export default useSearch;
