import {
    FaHome,
    FaUsers,
    FaCog,
    FaSignOutAlt,
    FaHardHat,
    FaUserShield,
    FaBars,
    FaTimes,
} from "react-icons/fa";
import { NavLink } from "react-router-dom";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function Sidebar({ logout }) {
    const [open, setOpen] = useState(false);

    const { i18n, t } = useTranslation();

    function handleLogout() {
        const ok = confirm(t("logout_confirm"));
        if (!ok) return;
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
            {/* 🔥 Mobile Top Bar */}
            <div className="lg:hidden flex items-center justify-between bg-slate-950 text-white px-4 py-3">
                <h2 className="font-semibold">{t("smartcity")}</h2>
                <button onClick={() => setOpen(true)}>
                    <FaBars size={20} />
                </button>
            </div>

            {/* 🔥 Overlay */}
            {open && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setOpen(false)}
                />
            )}

            {/* 🔥 Sidebar */}
            <aside
                className={`
                fixed lg:static top-0 left-0 z-50
                h-screen w-64 bg-slate-950 text-slate-100 flex flex-col
                transform transition-transform duration-300
                ${open ? "translate-x-0" : "-translate-x-full"}
                lg:translate-x-0
            `}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-4 border-b border-slate-800">

                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-indigo-600/20 grid place-items-center text-indigo-300 font-bold">
                            SC
                        </div>

                        <div>
                            <h2 className="text-base font-semibold leading-5">
                                {t("smartcity")}
                            </h2>
                            <p className="text-xs text-slate-400">
                                {t("admin_dashboard")}
                            </p>
                        </div>
                    </div>

                    {/* 🌐 Language Button */}
                    <button
                        onClick={toggleLang}
                        className="text-xs px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 transition border border-slate-700"
                    >
                        {i18n.language === "en" ? "AR" : "EN"}
                    </button>
                </div>

                {/* Nav */}
                <nav className="flex flex-col grow p-2 space-y-1">
                    <SideLink to="/" icon={<FaHome />} label={t("dashboard")} end />
                    <SideLink to="/reports" icon={<FaUsers />} label={t("reports")} />
                    <SideLink to="/technicals" icon={<FaHardHat />} label={t("technicals")} />
                    <SideLink to="/admins" icon={<FaUserShield />} label={t("admins")} />
                    <SideLink to="/settings" icon={<FaCog />} label={t("settings")} />
                </nav>

                {/* Logout */}
                <div className="p-3 border-t border-slate-800">
                    <button
                        onClick={handleLogout}
                        className="group flex items-center gap-3 rounded-xl px-3 py-2.5 w-full
                        bg-slate-900/40 border border-slate-800
                        hover:bg-red-500/10 hover:border-red-500/30
                        transition"
                    >
                        <span
                            className="h-9 w-9 rounded-xl grid place-items-center
                            bg-slate-800/70 border border-slate-700
                            group-hover:bg-red-500/15 group-hover:border-red-500/30
                            transition"
                        >
                            <FaSignOutAlt className="text-slate-200 group-hover:text-red-300 transition" />
                        </span>

                        <div className="text-left">
                            <p className="text-sm font-semibold text-slate-100 group-hover:text-red-200 transition">
                                {t("logout")}
                            </p>
                            <p className="text-xs text-slate-400 group-hover:text-red-300/80 transition">
                                {t("logout_desc")}
                            </p>
                        </div>
                    </button>
                </div>
            </aside>
        </>
    );
}

function SideLink({ to, icon, label, end }) {
    return (
        <NavLink
            to={to}
            end={end}
            className={({ isActive }) =>
                `flex items-center gap-3 p-3 rounded-xl transition w-full text-left
                ${isActive
                    ? "bg-slate-800 text-white"
                    : "hover:bg-slate-800 text-slate-100"
                }`
            }
        >
            <div className="text-xl">{icon}</div>
            <span className="text-sm">{label}</span>
        </NavLink>
    );
}
