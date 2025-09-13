// src/pages/VectorSearch.tsx
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchResult {
  id: string;
  title: string;
  snippet?: string;
  score?: number;
}

// Mock API function - replace with your actual vector search API
const handleVectorSearch = async (query: string): Promise<SearchResult[]> => {
  try {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Replace with your actual vector search API call
    const response = await fetch('/api/vector-search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error('Vector search failed');
    }

    const data = await response.json();
    return data.results;
  } catch (error) {
    // For demo purposes, return mock results
    console.error('Vector search failed:', error);
    return [
      {
        id: "1",
        title: "Mountain Landscape Photography",
        snippet: "Stunning mountain landscapes with golden hour lighting, perfect for nature enthusiasts.",
        score: 0.95
      },
      {
        id: "2", 
        title: "Urban Architecture at Night",
        snippet: "Modern cityscape featuring illuminated skyscrapers and urban design elements.",
        score: 0.89
      },
      {
        id: "3",
        title: "Macro Photography Collection",
        snippet: "Close-up shots of flowers, insects, and natural textures with incredible detail.",
        score: 0.84
      }
    ];
  }
};

const VectorSearch: React.FC = () => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) {
      setError("Please enter a search query.");
      setResults(null);
      return;
    }
    setLoading(true);
    setError(null);
    setResults(null);
    
    try {
      const searchResults = await handleVectorSearch(query.trim());
      setResults(searchResults);
    } catch {
      setError("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Vector Search</h1>
          <p className="text-muted-foreground">
            Advanced semantic search powered by AI embeddings
          </p>
        </div>

        <div className="max-w-2xl mx-auto p-6 bg-card rounded-md shadow-soft space-y-4">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Enter search query..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              disabled={loading}
              aria-label="Vector search input"
              autoFocus
              className="flex-grow"
            />
            <Button onClick={handleSearch} disabled={loading} variant="default">
              {loading ? "Searching..." : "Search"}
            </Button>
          </div>

          {error && <p className="text-destructive text-sm">{error}</p>}

          {results && (
            <div className="space-y-3">
              {results.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center">No results found.</p>
              ) : (
                results.map(({ id, title, snippet, score }) => (
                  <div
                    key={id}
                    className="p-4 border border-border rounded-lg hover:bg-accent/10 cursor-pointer transition-colors"
                    tabIndex={0}
                    role="article"
                    aria-label={`Search result: ${title}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-foreground">{title}</h3>
                      {score !== undefined && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                          {(score * 100).toFixed(1)}%
                        </span>
                      )}
                    </div>
                    {snippet && (
                      <p className="text-muted-foreground text-sm line-clamp-2">
                        {snippet}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {loading && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-3 text-muted-foreground">Searching vectors...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VectorSearch;
