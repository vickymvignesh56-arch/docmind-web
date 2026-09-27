import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Loader } from '../components/common/Loader/Loader';

export const PublicRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Loader fullScreen={true} message="Initializing DocMind..." />;
  }

  // If already authenticated, redirect to /dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};
