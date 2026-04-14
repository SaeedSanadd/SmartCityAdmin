import { useEffect } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { HeroUIProvider } from "@heroui/react";

import MainLayout from "./Layouts/MainLayout";
import AuthLayout from "./Layouts/AuthLayout";
import ProtectedRoute from "./Components/ProtectedRoute";
import AuthProtectedRoute from "./Components/AuthProtectedRoute";

import DashboardPage from "./Pages/DashboardPage";
import LoginPage from "./Pages/LoginPage";
import NotFoundPage from "./Pages/NotFoundPage";
import ReportMap from "./Components/ٌReportMap";
import ReportsPage from "./Pages/ReportsPage";
import ReportDetailsPage from "./Pages/ReportDetailsPage";
import TechnicalsPage from "./Pages/TechnicalsPage";
import AdminsPage from "./Pages/AdminsPage";
import SettingsPage from "./Pages/SettingsPage";

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
      { path: "settings", element: <SettingsPage /> },
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
    ],
  },
  { path: "*", element: <NotFoundPage /> },
]);

function App() {
  const { i18n } = useTranslation();

  useEffect(() => {
    const lang = i18n.language;

    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [i18n.language]);

  return (
    <HeroUIProvider>
      <RouterProvider router={router} />
    </HeroUIProvider>
  );
}

export default App;
