import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet } from '@tanstack/react-router';
import DashboardPage from './pages/DashboardPage';
import AdminPage from './pages/AdminPage';
import IncomeEntryPage from './pages/IncomeEntryPage';
import AppLayout from './components/AppLayout';

const rootRoute = createRootRoute({
  component: () => (
    <AppLayout>
      <Outlet />
    </AppLayout>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: DashboardPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminPage,
});

const incomeEntryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/income-entry',
  component: IncomeEntryPage,
});

const routeTree = rootRoute.addChildren([indexRoute, adminRoute, incomeEntryRoute]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
