import { createBrowserRouter } from 'react-router-dom';

import LandingPage from '../components/layout/LandingPage';
import AppShell from '../components/layout/AppShell';
import DashboardPage from '../features/dashboard/DashboardPage';
import DailyLogPage from '../features/daily-log/DailyLogPage';
import ExpensesPage from '../features/expenses/ExpensesPage';
import TasksPage from '../features/tasks/TasksPage';
import MemoriesPage from '../features/memories/MemoriesPage';
import CollectionsPage from '../features/collections/CollectionsPage';
import ModulesPage from '../features/modules/ModulesPage';
import InsightsPage from '../features/insights/InsightsPage';
import SettingsPage from '../features/settings/SettingsPage';
import NotFoundPage from '../components/layout/NotFoundPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/app',
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'daily-log',
        element: <DailyLogPage />,
      },
      {
        path: 'expenses',
        element: <ExpensesPage />,
      },
      {
        path: 'tasks',
        element: <TasksPage />,
      },
      {
        path: 'memories',
        element: <MemoriesPage />,
      },
      {
        path: 'collections',
        element: <CollectionsPage />,
      },
      {
        path: 'modules',
        element: <ModulesPage />,
      },
      {
        path: 'insights',
        element: <InsightsPage />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
