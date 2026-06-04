import {
  FaHome,FaUsers,FaCog,FaSignOutAlt,FaHardHat,
  FaUserShield,FaBars,FaTimes} from "react-icons/fa";
import { NavLink } from "react-router-dom";
import { useState } from "react";
import { useTranslation } from "react-i18next";
export default function Sidebar({ logout }) {
  const [open, setOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { i18n, t } = useTranslation();
  function handleLogout() {
    setShowLogoutModal(true);
  }
  function confirmLogout() {
    setShowLogoutModal(false);
    logout();
  }
  const toggleLang = () => {
    const newLang = i18n.language === "en" ? "ar" : "en";
    i18n.changeLanguage(newLang);
    localStorage.setItem("lang", newLang);
    document.documentElement.dir = newLang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = newLang;
  };
  return (
    <>
      {/* Mobile Top Bar */}
      <div className="lg:hidden flex items-center justify-between bg-[#06180c] text-white px-4 py-3 border-b border-emerald-900/20">
        <h2 className="font-semibold text-primary-400">{t("smartcity")}</h2>
        <button
          onClick={() => setOpen(true)}
          className="text-slate-300 hover:text-white transition">
          <FaBars size={20} />
        </button>
      </div>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm animate-overlayIn"
          onClick={() => setOpen(false)}/>
      )}
      {/* Sidebar */}
      <aside
        className={`fixed lg:static top-0 left-0 z-50 h-screen w-[260px] flex flex-col bg-mesh-dark text-slate-100
                    transform transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]
                    ${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-emerald-900/15">
          <div className="flex items-center gap-3">
            <div
              className="h-10 w-10 rounded-xl bg-linear-to-br from-emerald-500 to-emerald-700 grid place-items-center text-white text-sm font-bold shadow-lg shadow-emerald-900/30 animate-float"
              style={{ animationDuration: "4s" }}>
              SC
            </div>
            <div>
              <h2 className="text-[15px] font-bold leading-5 tracking-wide text-white">
                {t("smartcity")}
              </h2>
              <p className="text-[10px] font-medium text-emerald-400/70 uppercase tracking-widest">
                {t("admin_dashboard")}
              </p>
            </div>
          </div>
          <button
            onClick={toggleLang}
            className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 hover:text-emerald-100 transition-all duration-200 border border-emerald-500/15 uppercase tracking-wider">
            {i18n.language === "en" ? "AR" : "EN"}
          </button>
        </div>
        {/* Nav */}
        <nav className="flex flex-col grow px-3 py-4 space-y-1">
          <SideLink to="/" icon={<FaHome />} label={t("dashboard")} end />
          <SideLink to="/reports" icon={<FaUsers />} label={t("reports")} />
          <SideLink
            to="/technicals" icon={<FaHardHat />} label={t("technicals")}/>
          <SideLink to="/admins" icon={<FaUserShield />} label={t("admins")} />
          <SideLink to="/settings" icon={<FaCog />} label={t("settings")} />
        </nav>
        {/* Logout */}
        <div className="px-3 pb-4 pt-2 border-t border-emerald-900/15">
          <button onClick={handleLogout}
          className="group flex items-center gap-3 rounded-xl px-3 py-2.5 w-fullbg-white/3 border border-emerald-500/6
          hover:bg-red-500/10 hover:border-red-500/20 transition-all duration-250">
            <span
              className="h-9 w-9 rounded-xl grid place-items-center bg-emerald-500/6 border border-emerald-500/10
              group-hover:bg-red-500/15 group-hover:border-red-500/20 transition-all duration-250">
              <FaSignOutAlt className="text-slate-400 group-hover:text-red-400 transition-colors duration-250" />
            </span>
            <div className="text-start">
              <p className="text-sm font-semibold text-slate-300 group-hover:text-red-300 transition-colors duration-250">
                {t("logout")}
              </p>
              <p className="text-[10px] text-slate-500 group-hover:text-red-400/70 transition-colors duration-250">
                {t("logout_desc")}
              </p>
            </div>
          </button>
        </div>
      </aside>
      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-999 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-overlayIn"
            onClick={() => setShowLogoutModal(false)}/>
          {/* Modal Card */}
          <div className="relative z-10 w-full max-w-sm mx-4 rounded-2xl overflow-hidden shadow-2xl animate-scaleIn">
            {/* Top accent bar */}
            <div className="h-1 bg-linear-to-r from-red-500 via-red-400 to-orange-400" />
            <div className="bg-[#0d1f14] border border-white/[0.07] px-7 py-7">
              {/* Icon */}
              <div className="flex justify-center mb-5">
                <div className="h-14 w-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shadow-lg">
                  <FaSignOutAlt className="text-red-400 text-xl" />
                </div>
              </div>
              {/* Title & message */}
              <h3 className="text-center text-base font-bold text-white mb-1.5 tracking-tight">
                {t("logout")}
              </h3>
              <p className="text-center text-sm text-slate-400 mb-7 leading-relaxed">
                {t("logout_confirm")}
              </p>
              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 bg-white/4 hover:bg-white/8 text-slate-300 hover:text-white text-sm font-semibold transition-all duration-200">
                  {t("cancel") || "Cancel"}
                </button>
                <button
                  onClick={confirmLogout}
                  className="flex-1 py-2.5 rounded-xl bg-linear-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white text-sm font-bold shadow-md hover:shadow-red-500/30 transition-all duration-200">
                  {t("logout")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
function SideLink({ to, icon, label, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all 
      duration-200 w-full text-start relative overflow-hidden${ isActive ? "bg-linear-to-r from-emerald-500/15 via-emerald-500/8 to-transparent text-emerald-300 font-semibold"
         : "text-slate-400 hover:text-slate-200 hover:bg-white/4"}`}>
      {({ isActive }) => (
        <>
          {/* Active indicator */}
          {isActive && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.4)]" />
          )}
          <div
            className={`text-lg shrink-0 transition-all duration-200 ${isActive ? "text-emerald-400" : "group-hover:scale-110 group-hover:text-emerald-400"}`}>
            {icon}
          </div>
          <span className="text-sm font-medium tracking-wide">{label}</span>
          {/* Hover shimmer */}
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-linear-to-r from-transparent via-white/3 to-transparent pointer-events-none" />
        </>
      )}
    </NavLink>
  );
}
