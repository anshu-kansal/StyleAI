import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-brand-accent rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-slate-500">Checking authentication...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login page but save the current location they were trying to go to
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && user) {
    const hasRole = user.roles.some((role) => allowedRoles.includes(role));
    if (!hasRole) {
      // User is authenticated but doesn't have required roles
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center space-y-4">
          <div className="p-4 bg-red-50 text-red-500 rounded-full dark:bg-red-950/20 dark:text-red-400">
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m0-6v2m0-5h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-serif font-bold text-slate-900 dark:text-white">
            Access Denied
          </h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-md text-sm">
            You do not have permission to view this page. If you believe this is an error, please contact support or switch to an authorized account.
          </p>
          <Navigate to="/" replace />
        </div>
      );
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
