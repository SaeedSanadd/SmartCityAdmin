import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../Context/AuthContext";
import Sidebar from "../Components/Sidebar";
import { useTranslation } from "react-i18next";
import { FaCalendarAlt } from "react-icons/fa";

const pageTitles = {
    "/": "dashboard",
    "/reports": "reports",
    "/technicals": "technicals",
    "/admins": "admins",
    "/settings": "settings",
};

export default function MainLayout() {
    const { setIsLoggedIn } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation();

    function logout() {
        localStorage.removeItem("token");
        setIsLoggedIn(false);
        navigate("/login", { replace: true });
    }

    // Determine page title from route
    const currentPath = location.pathname;
    const isReportDetail = currentPath.startsWith("/reports/");
    const pageKey = isReportDetail ? "reports" : (pageTitles[currentPath] || "dashboard");

    // Format current date
    const now = new Date();
    const dateStr = now.toLocaleDateString(undefined, {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
    });

    return (
        <div className="flex h-screen overflow-hidden">
            {/* Sidebar */}
            <div className="shrink-0">
                <Sidebar logout={logout} />
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0 flex flex-col overflow-hidden bg-mesh">
                {/* Top Bar */}
                <header className="shrink-0 px-6 py-3.5 flex items-center justify-between border-b border-slate-100 bg-white/60 backdrop-blur-md">
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse-glow" />
                        <h2 className="text-sm font-bold text-slate-800 tracking-wide uppercase">
                            {t(pageKey)}
                        </h2>
                        {isReportDetail && (
                            <span className="text-slate-300 mx-1">/</span>
                        )}
                        {isReportDetail && (
                            <span className="text-xs text-slate-400 font-medium">Details</span>
                        )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                        <FaCalendarAlt className="text-primary/50" />
                        <span>{dateStr}</span>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 min-w-0 overflow-auto p-6">
                    <div className="page-enter">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}