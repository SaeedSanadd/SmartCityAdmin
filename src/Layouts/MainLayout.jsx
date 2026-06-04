import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useContext, useEffect, useState, useMemo } from "react";

import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import { AuthContext } from "../Context/AuthContext";
import Sidebar from "../Components/Sidebar";
import { useTranslation } from "react-i18next";
import { FaCalendarAlt, FaBell } from "react-icons/fa";

const pageTitles = {
  "/": "dashboard",
  "/reports": "reports",
  "/technicals": "technicals",
  "/admins": "admins",
  "/settings": "settings",
  "/bins-reports": "bins_reports",
};

export default function MainLayout() {
  const { setIsLoggedIn } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [dismissedIds, setDismissedIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("dismissedNotifications") || "[]");
    } catch {
      return [];
    }
  });
  const activeNotifications = useMemo(() => {
    return notifications.filter((n) => !dismissedIds.includes(n.id));
  }, [notifications, dismissedIds]);
  const unreadCount = useMemo(() => {
    return activeNotifications.filter((r) => r.status === "pending").length;
  }, [activeNotifications]);
  useEffect(() => {
    const q = query(
      collection(db, "reports"),
      orderBy("createdAt", "desc"),
      limit(5),
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setNotifications(items);
    });
    return () => unsubscribe();
  }, []);
  const dismissNotification = (e, id) => {
    e.stopPropagation();
    const updated = [...dismissedIds, id];
    setDismissedIds(updated);
    localStorage.setItem("dismissedNotifications", JSON.stringify(updated));
  };
  const markAllAsRead = () => {
    const allIds = notifications.map((n) => n.id);
    const updated = Array.from(new Set([...dismissedIds, ...allIds]));
    setDismissedIds(updated);
    localStorage.setItem("dismissedNotifications", JSON.stringify(updated));
  };
  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("adminUid");
    setIsLoggedIn(false);
    navigate("/login", { replace: true });
  }
  // Determine page title from route
  const currentPath = location.pathname;
  const isReportDetail = currentPath.startsWith("/reports/");
  const isBinDetail = currentPath.startsWith("/bins-reports/");
  const pageKey = isReportDetail
    ? "reports"
    : isBinDetail
      ? "bins_reports"
      : pageTitles[currentPath] || "dashboard";
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
        <header className="shrink-0 px-6 py-3.5 flex items-center justify-between border-b border-slate-100 bg-white/60 backdrop-blur-md relative z-[1000]">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse-glow" />
            <h2 className="text-sm font-bold text-slate-800 tracking-wide uppercase">
              {t(pageKey)}
            </h2>
            {(isReportDetail || isBinDetail) && <span className="text-slate-300 mx-1">/</span>}
            {(isReportDetail || isBinDetail) && (
              <span className="text-xs text-slate-400 font-medium">
                Details
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative h-9 w-9 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-700 transition flex items-center justify-center cursor-pointer">
                <FaBell className="text-sm" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white">
                    {unreadCount}
                  </span>
                )}
              </button>
              {/* Notifications Dropdown Panel */}
              {showNotifications && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowNotifications(false)}/>
                  <div
                    className={`absolute ${document.documentElement.dir === "rtl" ? "left-0" : "right-0"} mt-2 w-72 rounded-2xl bg-white border border-slate-100 shadow-xl py-3 px-2 z-50 animate-scaleIn`}>
                    <div className="px-3 pb-2 border-b border-slate-50 flex items-center justify-between">
                      <span className="font-bold text-slate-800 text-xs">
                        {t("recent_activity")}
                      </span>
                      {activeNotifications.length > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-[9px] text-primary hover:underline font-bold transition cursor-pointer">
                          {t("mark_all_read") || "Mark all as read"}
                        </button>
                      )}
                    </div>
                    <div className="space-y-1 mt-2 max-h-60 overflow-y-auto">
                      {activeNotifications.length === 0 ? (
                        <div className="text-center py-6 text-xs text-slate-400">
                          {t("no_notifications")}
                        </div>
                      ) : (
                        activeNotifications.map((notif) => (
                          <button
                            key={notif.id}
                            onClick={() => {
                              setShowNotifications(false);
                              navigate(`/reports/${notif.id}`);
                            }}
                            className="w-full text-start flex gap-3 p-2 rounded-xl hover:bg-slate-50 transition cursor-pointer relative group">
                            <div
                              className={`h-8 w-8 rounded-lg shrink-0 flex items-center justify-center text-xs font-bold
                                ${notif.status ==="pending" ? "bg-amber-50 text-amber-600 border border-amber-100"
                                  : notif.status ==="in_progress" ? "bg-blue-50 text-blue-600 border border-blue-100"
                                  : "bg-green-50 text-green-600 border border-green-100"}`}>
                              {(notif.type || "R").charAt(0)}
                            </div>
                            <div
                              className={`min-w-0 flex-1 ${document.documentElement.dir === "rtl" ? "pl-4" : "pr-4"}`}>
                              <p className="font-semibold text-slate-800 text-xs truncate">
                                {notif.type}
                              </p>
                              <p className="text-[10px] text-slate-400 truncate mt-0.5">
                                {notif.address}
                              </p>
                            </div>
                            <button
                              onClick={(e) => dismissNotification(e, notif.id)}
                              className={`absolute ${document.documentElement.dir === "rtl" ? "left-2" : "right-2"} top-1/2 -translate-y-1/2 h-5 w-5 rounded-full flex items-center justify-center text-[9px] text-slate-300 hover:text-slate-500 hover:bg-slate-100 transition opacity-0 group-hover:opacity-100 z-10 cursor-pointer`}
                              title={t("dismiss") || "Dismiss"}>
                              ✕
                            </button>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
              <FaCalendarAlt className="text-primary/50" />
              <span>{dateStr}</span>
            </div>
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
