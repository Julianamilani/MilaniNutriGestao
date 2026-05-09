import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  inverse?: boolean; // If true, only accessible when NOT logged in (e.g. Login page)
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, inverse = false }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#fdfbf7' }}>
        <div style={{ color: '#047857', fontWeight: 600 }}>Carregando...</div>
      </div>
    );
  }

  if (inverse) {
    // If we are logged in and trying to access an "inverse" route (like login/signup)
    if (user) {
      return <Navigate to="/dashboard" replace />;
    }
    return <>{children}</>;
  }

  // If we are NOT logged in and trying to access a protected route
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
