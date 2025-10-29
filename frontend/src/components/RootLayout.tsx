/**
 * Root Layout Component
 * Wraps all routes with AuthProvider
 */

import { Outlet } from 'react-router-dom';
import { AuthProvider } from '../hooks/useAuth';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
}
