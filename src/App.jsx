import { useEffect, lazy, Suspense } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { HeroUIProvider } from "@heroui/react";
import MainLayout from "./Layouts/MainLayout";
import AuthLayout from "./Layouts/AuthLayout";
import ProtectedRoute from "./Components/ProtectedRoute";
import AuthProtectedRoute from "./Components/AuthProtectedRoute";

// Lazy load pages for code splitting
const DashboardPage = lazy(() => import("./Pages/DashboardPage"));
const LoginPage = lazy(() => import("./Pages/LoginPage"));
const NotFoundPage = lazy(() => import("./Pages/NotFoundPage"));
const ReportsPage = lazy(() => import("./Pages/ReportsPage"));
const ReportDetailsPage = lazy(() => import("./Pages/ReportDetailsPage"));
const TechnicalsPage = lazy(() => import("./Pages/TechnicalsPage"));
const AdminsPage = lazy(() => import("./Pages/AdminsPage"));
const SettingsPage = lazy(() => import("./Pages/SettingsPage"));
const ResetPasswordPage = lazy(() => import("./Pages/ResetPasswordPage"));

// Loading fallback
function PageLoader() {
    return (
        <div className="flex items-center justify-center h-[60vh]">
            <div className="flex flex-col items-center gap-3">
                <div className="spinner !border-primary/30 !border-t-primary !w-8 !h-8" />
                <p className="text-sm text-slate-400 font-medium">Loading…</p>
            </div>
        </div>
    );
}

function SuspenseWrap({ children }) {
    return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

const router = createBrowserRouter([
    {
        path: "/",
        element: (
            <ProtectedRoute>
                <MainLayout />
            </ProtectedRoute>
        ),
        children: [
            { index: true, element: <SuspenseWrap><DashboardPage /></SuspenseWrap> },
            { path: "reports", element: <SuspenseWrap><ReportsPage /></SuspenseWrap> },
            { path: "reports/:id", element: <SuspenseWrap><ReportDetailsPage /></SuspenseWrap> },
            { path: "technicals", element: <SuspenseWrap><TechnicalsPage /></SuspenseWrap> },
            { path: "admins", element: <SuspenseWrap><AdminsPage /></SuspenseWrap> },
            { path: "settings", element: <SuspenseWrap><SettingsPage /></SuspenseWrap> },
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
                        <SuspenseWrap><LoginPage /></SuspenseWrap>
                    </AuthProtectedRoute>
                ),
            },
            {
                path: "reset-password",
                element: (
                    <AuthProtectedRoute>
                        <SuspenseWrap><ResetPasswordPage /></SuspenseWrap>
                    </AuthProtectedRoute>
                ),
            },
        ],
    },
    { path: "*", element: <SuspenseWrap><NotFoundPage /></SuspenseWrap> },
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
