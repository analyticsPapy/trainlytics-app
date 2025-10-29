import { createBrowserRouter } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { AthleteDashboard } from './pages/AthleteDashboard';
import { CoachDashboard } from './pages/CoachDashboard';
import { ProPage } from './pages/ProPage';
import { LabPage } from './pages/LabPage';
import { ConnectPage } from './pages/ConnectPage';
import Login from './pages/Login';
import AuthGuard, { PublicGuard } from './components/AuthGuard';
import { UserType } from './types/api';
import RootLayout from './components/RootLayout';

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: '/',
        element: <LandingPage />,
      },
      {
        path: '/login',
        element: (
          <PublicGuard>
            <Login />
          </PublicGuard>
        ),
      },
      {
        path: '/athlete',
        element: (
          <AuthGuard requiredUserType={UserType.ATHLETE}>
            <AthleteDashboard />
          </AuthGuard>
        ),
      },
      {
        path: '/coach',
        element: (
          <AuthGuard requiredUserType={UserType.COACH}>
            <CoachDashboard />
          </AuthGuard>
        ),
      },
      {
        path: '/pro',
        element: (
          <AuthGuard requiredUserType={UserType.PRO}>
            <ProPage />
          </AuthGuard>
        ),
      },
      {
        path: '/lab',
        element: (
          <AuthGuard requiredUserType={UserType.LAB}>
            <LabPage />
          </AuthGuard>
        ),
      },
      {
        path: '/connect',
        element: (
          <AuthGuard>
            <ConnectPage />
          </AuthGuard>
        ),
      },
    ],
  },
]);
