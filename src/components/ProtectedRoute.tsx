import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  element: React.ReactElement;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ element }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    // Optionally render a loading spinner or null while checking auth
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to={`/?redirect=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }

  return element;
};

export default ProtectedRoute;
