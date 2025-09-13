// src/components/ProtectedRoute.tsx - ROLE-BASED ROUTE PROTECTION
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'editor' | 'user';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access
  if (requiredRole) {
    const userRole = user?.user_metadata?.role || 'user';
    
    if (requiredRole === 'admin' && userRole !== 'admin') {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
            <p className="text-muted-foreground mb-4">
              You need administrator privileges to access this page.
            </p>
            <button 
              onClick={() => window.history.back()}
              className="bg-primary text-white px-4 py-2 rounded-lg"
            >
              Go Back
            </button>
          </div>
        </div>
      );
    }

    if (requiredRole === 'editor' && !['admin', 'editor'].includes(userRole)) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
            <p className="text-muted-foreground mb-4">
              You need editor privileges to access this page.
            </p>
            <button 
              onClick={() => window.history.back()}
              className="bg-primary text-white px-4 py-2 rounded-lg"
            >
              Go Back
            </button>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
