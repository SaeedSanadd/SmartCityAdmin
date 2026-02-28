import { FaHome, FaUsers, FaCog, FaSignOutAlt } from "react-icons/fa";
import { NavLink } from "react-router-dom";

export default function Sidebar({ logout }) {
    function handleLogout() {
        // ✅ لو مش عايز confirm امسح 3 سطور دول
        const ok = confirm("Are you sure you want to logout?");
        if (!ok) return;

        logout();
    }

    return (
        <aside className="w-64 bg-slate-950 text-slate-100 flex flex-col h-screen">
            {/* Brand */}
            <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-800">
                <div className="h-9 w-9 rounded-xl bg-indigo-600/20 grid place-items-center text-indigo-300 font-bold">
                    SC
                </div>
                <div>
                    <h2 className="text-base font-semibold leading-5">SmartCity</h2>
                    <p className="text-xs text-slate-400">Admin Dashboard</p>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex flex-col grow p-2 space-y-1">
                <SideLink to="/" icon={<FaHome />} label="Dashboard" end />
                <SideLink to="/reports" icon={<FaUsers />} label="Reports" />
                <SideLink to="/technicals" icon={<FaHardHat />} label="Technicals" />
                <SideLink to="/settings" icon={<FaCog />} label="Settings" />
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
                            Logout
                        </p>
                        <p className="text-xs text-slate-400 group-hover:text-red-300/80 transition">
                            End current session
                        </p>
                    </div>
                </button>
            </div>
        </aside>
    );
}

function SideLink({ to, icon, label, end }) {
    return (
        <NavLink
            to={to}
            end={end}
            className={({ isActive }) =>
                `flex items-center gap-3 p-3 rounded-xl transition w-full text-left
         ${isActive ? "bg-slate-800 text-white" : "hover:bg-slate-800 text-slate-100"}`
            }
        >
            <div className="text-xl">{icon}</div>
            <span className="text-sm">{label}</span>
        </NavLink>
    );
}