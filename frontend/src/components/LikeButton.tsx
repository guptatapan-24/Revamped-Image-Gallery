// src/components/ui/LikeButton.tsx
import React, { useState } from "react";
import { Heart } from "lucide-react";

interface LikeButtonProps {
  initialCount: number;
  initiallyLiked?: boolean;
  onLikeChange?: (liked: boolean) => void;
}

export const LikeButton: React.FC<LikeButtonProps> = ({
  initialCount,
  initiallyLiked = false,
  onLikeChange,
}) => {
  const [liked, setLiked] = useState(initiallyLiked);
  const [count, setCount] = useState(initialCount);

  const toggleLike = () => {
    const newLiked = !liked;
    setLiked(newLiked);
    setCount((prev) => (newLiked ? prev + 1 : prev - 1));
    onLikeChange?.(newLiked);
  };

  return (
    <button
      type="button"
      onClick={toggleLike}
      className={`inline-flex items-center gap-1 focus:outline-none transition-colors ${
        liked ? "text-destructive" : "text-muted-foreground hover:text-destructive"
      }`}
      aria-pressed={liked}
      aria-label={liked ? "Unlike" : "Like"}
    >
      <Heart className="w-5 h-5" fill={liked ? "currentColor" : "none"} />
      <span className="select-none">{count}</span>
    </button>
  );
};
