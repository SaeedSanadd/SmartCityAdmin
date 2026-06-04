import { FaCity, FaHome, FaExclamationTriangle } from "react-icons/fa";
import { Link } from "react-router-dom";
import bg from "./../assets/bg.png";

export default function NotFoundPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-cover bg-center relative px-4"
        style={{ backgroundImage: `url(${bg})` }}>
            {/* Overlay */}
            <div className="absolute inset-0 bg-linear-to-br from-black/60 via-emerald-950/30 to-black/70" />
            {/* Floating shapes */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[20%] left-[15%] h-24 w-24 rounded-full bg-emerald-500/5 animate-float" style={{ animationDuration: '5s' }} />
                <div className="absolute bottom-[25%] right-[20%] h-20 w-20 rounded-full bg-emerald-400/5 animate-float" style={{ animationDuration: '6s', animationDelay: '1s' }} />
            </div>
            {/* Card */}
            <div className="relative animate-scaleIn">
                <div className="rounded-3xl overflow-hidden shadow-2xl">
                    <div className="h-1.5 bg-linear-to-r from-amber-400 via-red-400 to-amber-500" />
                    <div className="glass-card-strong w-full max-w-md p-8 text-center">
                        <div className="h-14 w-14 rounded-2xl bg-linear-to-br from-emerald-500 to-emerald-700 mx-auto mb-5 flex items-center justify-center shadow-lg shadow-emerald-500/20 animate-float" style={{ animationDuration: '4s' }}>
                            <FaCity className="text-2xl text-white" />
                        </div>
                        <h1 className="text-7xl font-extrabold text-slate-800 mb-2 tracking-tighter animate-fadeInUp">
                            404
                        </h1>
                        <div className="flex items-center justify-center gap-2 text-amber-500 mb-3 animate-fadeInUp stagger-2">
                            <FaExclamationTriangle />
                            <p className="font-semibold text-amber-600">Page Not Found</p>
                        </div>
                        <p className="text-slate-400 text-sm mb-7 leading-relaxed animate-fadeInUp stagger-3">
                            The page you are trying to access does not exist or has been
                            moved.
                        </p>
                        <Link to="/login"
                        className="inline-flex items-center gap-2 bg-linear-to-r from-primary to-emerald-600 hover:from-primary-hover hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-bold shadow-md hover:shadow-lg transition-all cursor-pointer animate-fadeInUp stagger-4">
                            <FaHome />Back to Login
                        </Link>
                        <p className="text-xs text-slate-300 mt-7 select-none font-medium">
                            © 2026 Smart City Management System
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
