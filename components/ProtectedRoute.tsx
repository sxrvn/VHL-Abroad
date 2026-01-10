import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'student' | 'admin';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined animate-spin text-6xl text-primary">progress_activity</span>
          <p className="mt-4 text-lg font-semibold">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && profile?.role !== requiredRole) {
    // Admins can access everything, but students can only access student pages
    if (profile?.role === 'student' && requiredRole === 'admin') {
      // Student trying to access admin page -> redirect to student dashboard
      return <Navigate to="/dashboard" replace />;
    }
    // Admin trying to access student page -> allow it (no redirect)
  }

  return <>{children}</>;
};

export default ProtectedRoute;
