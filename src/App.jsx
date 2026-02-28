import { useState } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import MainLayout from './Layouts/MainLayout';
import AuthLayout from './Layouts/AuthLayout';
import LoginPage from './Pages/LoginPage';
import DashboardPage from './Pages/DashboardPage';
import ResetPasswordPage from './Pages/ResetPasswordPage';
import NotFoundPage from './Pages/NotFoundPage';
import ReportMap from './Components/ٌReportMap';
import { HeroUIProvider } from '@heroui/react';
import ProtectedRoute from './Components/ProtectedRoute';
import AuthProtectedRoute from './Components/AuthProtectedRoute';
import ReportsPage from './Pages/ReportsPage';
import ReportDetailsPage from './Pages/ReportDetailsPage';
import TechnicalsPage from './Pages/TechnicalsPage';
import AdminsPage from "./Pages/AdminsPage";
const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "map", element: <ReportMap /> },
      { path: "reports", element: <ReportsPage /> },
      { path: "reports/:id", element: <ReportDetailsPage /> },
      { path: "technicals", element: <TechnicalsPage /> },
      { path: "admins", element: <AdminsPage /> },
    ],
  },
  {
    path: "/",
    element: <AuthLayout />,
    children: [
      {
        path: "login",
        element: (
          <AuthProtectedRoute>
            <LoginPage />
          </AuthProtectedRoute>
        ),
      },
      // { path: "reset-password", element: <ResetPasswordPage /> },
    ],
  },
  { path: "*", element: <NotFoundPage /> },
]);

function App() {
  return (
    <>
      <HeroUIProvider>
        <RouterProvider router={router} />
      </HeroUIProvider>
    </>
  );
}

export default App;
