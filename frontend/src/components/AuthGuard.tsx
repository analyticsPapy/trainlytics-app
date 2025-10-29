/**
 * AuthGuard Component
 * Protects routes by requiring authentication
 */

import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UserType } from '../types/api';

interface AuthGuardProps {
  children: ReactNode;
  requiredUserType?: UserType;
  redirectTo?: string;
}

/**
 * AuthGuard Component
 * Redirects to login if not authenticated
 * Optionally checks for specific user type
 */
export default function AuthGuard({
  children,
  requiredUserType,
  redirectTo = '/login',
}: AuthGuardProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check user type if required
  if (requiredUserType && user?.user_type !== requiredUserType) {
    // Redirect to appropriate dashboard based on user type
    const userTypeRedirects: Record<UserType, string> = {
      [UserType.ATHLETE]: '/athlete',
      [UserType.COACH]: '/coach',
      [UserType.PRO]: '/pro',
      [UserType.LAB]: '/lab',
    };

    const redirect = user?.user_type
      ? userTypeRedirects[user.user_type]
      : '/login';

    return <Navigate to={redirect} replace />;
  }

  return <>{children}</>;
}

/**
 * Public Route Guard
 * Redirects authenticated users away from public pages (like login)
 */
interface PublicGuardProps {
  children: ReactNode;
  redirectTo?: string;
}

export function PublicGuard({
  children,
  redirectTo,
}: PublicGuardProps) {
  const { isAuthenticated, isLoading, user } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect authenticated users to their dashboard
  if (isAuthenticated) {
    if (redirectTo) {
      return <Navigate to={redirectTo} replace />;
    }

    // Redirect based on user type
    const userTypeRedirects: Record<UserType, string> = {
      [UserType.ATHLETE]: '/athlete',
      [UserType.COACH]: '/coach',
      [UserType.PRO]: '/pro',
      [UserType.LAB]: '/lab',
    };

    const redirect = user?.user_type
      ? userTypeRedirects[user.user_type]
      : '/athlete';

    return <Navigate to={redirect} replace />;
  }

  return <>{children}</>;
}
