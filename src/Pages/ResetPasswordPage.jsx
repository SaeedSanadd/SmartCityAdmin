import { useState } from "react";
import { FaEnvelope, FaArrowLeft, FaCity, FaCheckCircle } from "react-icons/fa";
import { Link } from "react-router-dom";
import bg from "./../assets/bg.png";
import { auth } from "../firebase/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { useTranslation } from "react-i18next";

export default function ResetPasswordPage() {
    const { t, i18n } = useTranslation();
    const [email, setEmail] = useState("");
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const toggleLang = () => {
        const newLang = i18n.language === "en" ? "ar" : "en";
        i18n.changeLanguage(newLang);
        localStorage.setItem("lang", newLang);
        document.documentElement.dir = newLang === "ar" ? "rtl" : "ltr";
        document.documentElement.lang = newLang;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await sendPasswordResetEmail(auth, email);
            setSent(true);
        } catch (err) {
            console.error("Password reset error:", err);
            if (err.code === "auth/user-not-found" || err.code === "auth/invalid-email") {
                setError(t("user_not_found"));
            } else {
                setError(t("reset_error"));
            }
        } finally {
            setLoading(false);
        }
    };

    const isRtl = i18n.language === "ar";

    return (
        <div
            className="min-h-screen flex items-center justify-center bg-cover bg-center relative px-4 sm:px-6 lg:px-8"
            style={{ backgroundImage: `url(${bg})` }}
        >
            {/* Animated overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-emerald-950/30 to-black/70" />

            {/* Floating decorative shapes */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[15%] left-[10%] h-32 w-32 rounded-full bg-emerald-500/5 animate-float" style={{ animationDuration: '5s' }} />
                <div className="absolute top-[60%] right-[15%] h-24 w-24 rounded-full bg-emerald-400/5 animate-float" style={{ animationDuration: '7s', animationDelay: '1s' }} />
                <div className="absolute bottom-[20%] left-[30%] h-16 w-16 rounded-full bg-emerald-300/5 animate-float" style={{ animationDuration: '6s', animationDelay: '2s' }} />
            </div>

            {/* Card */}
            <div className="relative w-full max-w-md animate-scaleIn">
                <div className="rounded-3xl overflow-hidden shadow-2xl">
                    {/* Top gradient bar */}
                    <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-primary to-emerald-600" />

                    <div className="glass-card-strong p-7 sm:p-8">
                        {/* Language Button */}
                        <div className="flex justify-end mb-5">
                            <button
                                onClick={toggleLang}
                                className="text-[10px] font-bold px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all border border-slate-200/60 uppercase tracking-wider"
                            >
                                {i18n.language === "en" ? "AR" : "EN"}
                            </button>
                        </div>

                        {!sent ? (
                            <>
                                {/* Header */}
                                <div className="text-center mb-6">
                                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 mx-auto mb-4 flex items-center justify-center shadow-lg shadow-emerald-500/20 animate-float" style={{ animationDuration: '4s' }}>
                                        <FaCity className="text-2xl text-white" />
                                    </div>
                                    <h1 className="text-xl font-bold text-slate-800 tracking-tight">
                                        {t("reset_password")}
                                    </h1>
                                    <p className="text-slate-400 text-sm mt-1">
                                        {t("reset_desc")}
                                    </p>
                                </div>

                                {/* Form */}
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="relative group">
                                        <FaEnvelope className={`absolute top-1/2 -translate-y-1/2 ${isRtl ? 'right-3.5' : 'left-3.5'} text-slate-300 group-focus-within:text-primary transition-colors text-sm`} />
                                        <input
                                            type="email"
                                            placeholder={t("admin_email")}
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            className={`w-full ${isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 bg-white/80 text-sm transition-all`}
                                        />
                                    </div>

                                    {/* Error Message */}
                                    {error && (
                                        <div className="rounded-xl border border-red-200/70 bg-red-50 px-4 py-2.5 text-xs text-red-700 font-medium flex items-center gap-2 animate-fadeInDown">
                                            <div className="h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />
                                            {error}
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-gradient-to-r from-primary to-emerald-600 hover:from-primary-hover hover:to-emerald-700 disabled:opacity-60 text-white py-3 rounded-xl font-bold shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                                    >
                                        {loading ? (
                                            <>
                                                <div className="spinner" />
                                                {t("loading")}
                                            </>
                                        ) : (
                                            t("send_reset_link")
                                        )}
                                    </button>

                                    <Link
                                        to="/login"
                                        className="flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-primary font-bold transition mt-4"
                                    >
                                        <FaArrowLeft className={isRtl ? "rotate-180" : ""} />
                                        {t("back_to_login")}
                                    </Link>
                                </form>
                            </>
                        ) : (
                            /* Success Message */
                            <div className="text-center space-y-4 py-4">
                                <div className="h-16 w-16 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto shadow-inner">
                                    <FaCheckCircle className="text-3xl" />
                                </div>
                                <h2 className="text-xl font-bold text-slate-800">
                                    {t("reset_success")}
                                </h2>
                                <p className="text-slate-400 text-sm">
                                    {t("reset_success_desc")}
                                </p>
                                <p className="font-bold text-slate-700 bg-slate-100/50 py-1.5 px-3 rounded-lg inline-block text-sm font-mono">{email}</p>

                                <div>
                                    <Link
                                        to="/login"
                                        className="inline-flex items-center gap-2 mt-4 bg-gradient-to-r from-primary to-emerald-600 hover:from-primary-hover hover:to-emerald-700 text-white px-5 py-3 rounded-xl font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
                                    >
                                        <FaArrowLeft className={isRtl ? "rotate-180" : ""} />
                                        {t("back_to_login")}
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
