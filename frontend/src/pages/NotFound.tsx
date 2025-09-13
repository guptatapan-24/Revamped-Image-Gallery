// src/pages/NotFound.tsx - ENHANCED WITH HELPFUL SUGGESTIONS
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';

const NotFound: React.FC = () => {
  const currentPath = window.location.pathname;

  // ✅ Provide helpful suggestions for common mistyped routes
  const getSuggestions = (path: string) => {
    const suggestions = [];
    
    if (path.includes('signup') || path.includes('register')) {
      suggestions.push({ path: '/register', label: 'Sign Up' });
    }
    if (path.includes('login') || path.includes('signin')) {
      suggestions.push({ path: '/login', label: 'Sign In' });
    }
    if (path.includes('profile')) {
      suggestions.push({ path: '/profile', label: 'Profile' });
    }
    if (path.includes('gallery')) {
      suggestions.push({ path: '/gallery', label: 'Gallery' });
    }
    
    return suggestions;
  };

  const suggestions = getSuggestions(currentPath);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-md mx-auto p-8">
        <h1 className="text-6xl font-bold text-muted-foreground mb-4">404</h1>
        <h2 className="text-2xl font-bold mb-4">Page Not Found</h2>
        <p className="text-muted-foreground mb-6">
          The page you're looking for doesn't exist.
        </p>
        
        {suggestions.length > 0 && (
          <div className="mb-6">
            <p className="text-sm text-muted-foreground mb-3">Did you mean:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {suggestions.map((suggestion) => (
                <Link key={suggestion.path} to={suggestion.path}>
                  <Button variant="outline" size="sm">
                    {suggestion.label}
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        )}
        
        <div className="space-y-2">
          <Link to="/">
            <Button className="w-full">
              Go Home
            </Button>
          </Link>
          <Link to="/gallery">
            <Button variant="outline" className="w-full">
              Browse Gallery
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
