// src/components/ImageComments.tsx
import React, { useState, useEffect, FormEvent } from 'react';
import { useAuth } from '../hooks/useAuth';

import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';

import { MessageCircle, Heart, Reply, Trash2 } from 'lucide-react';


interface Comment {
  id: string;
  text: string;
  author: string;
  authorId: string;
  avatar: string;
  timestamp: string;
  likes: number;
}

interface ImageCommentsProps {
  imageId: string;
  imageTitle?: string;
}

const ImageComments: React.FC<ImageCommentsProps> = ({ imageId, imageTitle }) => {
  const { user, isAuthenticated } = useAuth();
  console.log('🛠️ ImageComments rendered', { imageId, imageTitle });
  console.log('🛠️ Auth state', { isAuthenticated, user });


  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  /* ---------------------- helpers ---------------------- */

  const loadComments = () => {
    try {
      const saved = localStorage.getItem(`comments-${imageId}`);
      setComments(saved ? JSON.parse(saved) : []);
    } catch {
      setComments([]);
    }
  };

  const saveComments = (updated: Comment[]) => {
    localStorage.setItem(`comments-${imageId}`, JSON.stringify(updated));
    setComments(updated);
  };

  /* ----------------------- effects ---------------------- */

  useEffect(loadComments, [imageId]);

  /* -------------------- event handlers ------------------ */

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated || !user) {
      alert('Please log in to comment');
      return;
    }
    if (!newComment.trim()) return;

    setLoading(true);

    const comment: Comment = {
      id: Date.now().toString(),
      text: newComment.trim(),
      author:
        user.user_metadata?.full_name ||
        user.email?.split('@')[0] ||
        'Anonymous',
      authorId: user.id,
      avatar:
        user.user_metadata?.avatar_url ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(
          user.email || 'User'
        )}&background=3b82f6&color=ffffff`,
      timestamp: new Date().toISOString(),
      likes: 0,
    };

    saveComments([...comments, comment]);
    setNewComment('');
    setLoading(false);
  };

  const handleDelete = (id: string) =>
    saveComments(comments.filter((c) => c.id !== id));

  const handleLike = (id: string) =>
    saveComments(
      comments.map((c) =>
        c.id === id ? { ...c, likes: c.likes + 1 } : c
      )
    );

  /* ------------------------ render ---------------------- */

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Comments ({comments.length})
          {imageTitle && (
            <span className="text-sm text-muted-foreground">
              on “{imageTitle}”
            </span>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* -------- comment form -------- */}
        {isAuthenticated ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-start gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.user_metadata?.avatar_url} />
                <AvatarFallback>
                  {user.email?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write your comment..."
                  className="min-h-[80px] resize-none"
                />

                <div className="mt-2 flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!newComment.trim() || loading}
                    onClick={() => setNewComment('')}
                  >
                    Clear
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={!newComment.trim() || loading}
                  >
                    {loading ? 'Posting…' : 'Post Comment'}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        ) : (
          <div className="text-center p-6 bg-muted rounded-lg">
            <MessageCircle className="mx-auto h-8 w-8 mb-2 text-muted-foreground" />
            <p className="text-muted-foreground">
              Please{' '}
              <a href="/login" className="text-primary hover:underline">
                sign in
              </a>{' '}
              to leave a comment
            </p>
          </div>
        )}

        {/* -------- comments list -------- */}
        <div className="space-y-4">
          {comments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No comments yet. Be the first to comment!</p>
            </div>
          ) : (
            comments.map((c) => (
              <div
                key={c.id}
                className="flex gap-3 p-4 bg-muted/30 rounded-lg"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={c.avatar} />
                  <AvatarFallback>
                    {c.author.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{c.author}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(c.timestamp).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-sm leading-relaxed">{c.text}</p>

                  <div className="flex items-center gap-2 text-xs">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-muted-foreground hover:text-primary"
                      onClick={() => handleLike(c.id)}
                    >
                      <Heart className="h-3 w-3 mr-1" />
                      {c.likes}
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-muted-foreground hover:text-primary"
                    >
                      <Reply className="h-3 w-3 mr-1" />
                      Reply
                    </Button>

                    {isAuthenticated && user?.id === c.authorId && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDelete(c.id)}
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ImageComments;
