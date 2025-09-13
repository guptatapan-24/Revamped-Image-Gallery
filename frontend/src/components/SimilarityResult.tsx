// src/components/ui/SimilarityResult.tsx
import React from "react";

interface SimilarityItem {
  id: string;
  title: string;
  snippet?: string;
  similarityScore?: number;
}

interface SimilarityResultProps {
  results: SimilarityItem[];
  onSelect?: (item: SimilarityItem) => void;
}

export const SimilarityResult: React.FC<SimilarityResultProps> = ({
  results,
  onSelect,
}) => {
  if (results.length === 0) {
    return (
      <p className="text-muted-foreground text-sm text-center py-4">
        No similar results found.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {results.map(({ id, title, snippet, similarityScore }) => (
        <div
          key={id}
          role={onSelect ? "button" : undefined}
          tabIndex={onSelect ? 0 : undefined}
          onClick={() => onSelect?.({ id, title, snippet, similarityScore })}
          onKeyDown={(e) => {
            if (onSelect && (e.key === "Enter" || e.key === " ")) {
              onSelect({ id, title, snippet, similarityScore });
            }
          }}
          className="cursor-pointer border border-border rounded p-3 hover:bg-accent/10 transition focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          aria-label={`Similarity result: ${title}`}
        >
          <h3 className="text-foreground font-semibold text-lg">{title}</h3>
          {snippet && (
            <p className="text-muted-foreground mt-1 line-clamp-3">{snippet}</p>
          )}
          {similarityScore !== undefined && (
            <p className="text-sm text-muted-foreground mt-2">
              Similarity: {similarityScore.toFixed(3)}
            </p>
          )}
        </div>
      ))}
    </div>
  );
};
