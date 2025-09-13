// src/components/ui/CommentSection.tsx
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Comment {
  id: string;
  author: string;
  content: string;
  date: string; // ISO string or formatted string
}

interface CommentSectionProps {
  comments: Comment[];
  onAddComment: (content: string) => void;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ comments, onAddComment }) => {
  const [newComment, setNewComment] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newComment.trim();
    if (trimmed.length === 0) return;
    onAddComment(trimmed);
    setNewComment("");
  };

  return (
    <div className="bg-card p-4 rounded-md shadow-soft max-w-3xl mx-auto">
      <h2 className="text-lg font-semibold mb-4 text-foreground">Comments ({comments.length})</h2>

      <div className="flex flex-col space-y-4 max-h-96 overflow-y-auto mb-6">
        {comments.length === 0 && (
          <p className="text-muted-foreground text-center">No comments yet. Be the first!</p>
        )}
        {comments.map((comment) => (
          <div key={comment.id} className="border border-border rounded px-3 py-2 bg-background">
            <div className="flex justify-between items-center mb-1">
              <span className="font-medium text-foreground">{comment.author}</span>
              <time className="text-xs text-muted-foreground" dateTime={comment.date}>
                {new Date(comment.date).toLocaleString()}
              </time>
            </div>
            <p className="text-muted-foreground whitespace-pre-wrap">{comment.content}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          type="text"
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="flex-grow"
          aria-label="Add a comment"
          required
        />
        <Button type="submit" disabled={newComment.trim().length === 0}>
          Post
        </Button>
      </form>
    </div>
  );
};
