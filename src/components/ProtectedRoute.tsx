
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const PUBLIC_ROUTES = ['/', '/login', '/register', '/reset-password', '/update-password'];
const USER_ROUTE_REGEX = /^\/user\/.*/;

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const isPublicRoute = PUBLIC_ROUTES.includes(location.pathname) || USER_ROUTE_REGEX.test(location.pathname);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user && !isPublicRoute) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
