
import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';

interface AuthGuardProps {
  requireAuth?: boolean;
  requireAdmin?: boolean;
  redirectTo?: string;
  children?: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({
  requireAuth = false,
  requireAdmin = false,
  redirectTo = '/auth',
  children
}) => {
  const { user, isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isLoading) return;

    const isAuthenticated = !!user;
    const hasAdminAccess = isAdmin;

    if (requireAuth && !isAuthenticated) {
      navigate(redirectTo, { state: { from: location }, replace: true });
    } else if (requireAdmin && !hasAdminAccess) {
      navigate('/', { replace: true });
    }
  }, [user, isAdmin, isLoading, navigate, location, requireAuth, requireAdmin, redirectTo]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lilac-600 mx-auto"></div>
          <p className="mt-4 text-lilac-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (requireAuth && !user) {
    return null;
  }
  
  if (requireAdmin && !isAdmin) {
    return null;
  }

  return children ? <>{children}</> : <Outlet />;
};
