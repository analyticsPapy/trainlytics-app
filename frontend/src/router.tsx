import { createBrowserRouter } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { AthleteDashboard } from './pages/AthleteDashboard';
import { CoachDashboard } from './pages/CoachDashboard';
import { ProPage } from './pages/ProPage';
import { LabPage } from './pages/LabPage';
import { ConnectPage } from './pages/ConnectPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/athlete',
    element: <AthleteDashboard />,
  },
  {
    path: '/coach',
    element: <CoachDashboard />,
  },
  {
    path: '/pro',
    element: <ProPage />,
  },
  {
    path: '/lab',
    element: <LabPage />,
  },
  {
    path: '/connect',
    element: <ConnectPage />,
  },
]);
