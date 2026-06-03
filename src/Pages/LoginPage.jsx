import { FaCity, FaLock, FaEnvelope, FaEye, FaEyeSlash } from "react-icons/fa";
import bg from "./../assets/bg.png";
import * as zod from "zod";
import React, { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../Context/AuthContext";

import { auth, db } from "../firebase/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useTranslation } from "react-i18next";

const schema = zod.object({
    email: zod.string().nonempty("Email is required"),
    password: zod.string().nonempty("Password is required"),
});

export default function LoginPage() {
    const { t, i18n } = useTranslation();

    const [apiError, setApiError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);
    const isRtl = i18n.language === "ar";

    const { setIsLoggedIn } = useContext(AuthContext);
    const navigate = useNavigate();

    const {
        handleSubmit,
        register,
        formState: { errors, isSubmitting },
    } = useForm({
        defaultValues: { email: "", password: "" },
        resolver: zodResolver(schema),
        mode: "onTouched",
    });

    const toggleLang = () => {
        const newLang = i18n.language === "en" ? "ar" : "en";
        i18n.changeLanguage(newLang);
        localStorage.setItem("lang", newLang);
        document.documentElement.dir = newLang === "ar" ? "rtl" : "ltr";
    };

    async function signIn(values) {
        setApiError(null);
        setLoading(true);

        try {
            const userCredential = await signInWithEmailAndPassword(
                auth,
                values.email,
                values.password
            );
            const user = userCredential.user;
            const docRef = doc(db, "admins", user.uid);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) {
                setApiError(t("not_admin"));
                return;
            }

            localStorage.setItem("adminUid", user.uid);
            localStorage.setItem("token", user.uid);
            setIsLoggedIn(true);
            navigate("/", { replace: true });
        } catch (error) {
            if (error.code === "auth/user-not-found") {
                setApiError(t("user_not_found"));
            } else if (error.code === "auth/wrong-password") {
                setApiError(t("wrong_password"));
            } else if (error.code === "auth/invalid-credential") {
                setApiError(t("invalid_credentials"));
            } else {
                setApiError(error.message);
            }
        } finally {
            setLoading(false);
        }
    }

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

            {/* Login Card */}
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

                        {/* Brand */}
                        <div className="text-center mb-7">
                            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 mx-auto mb-4 flex items-center justify-center shadow-lg shadow-emerald-500/20 animate-float" style={{ animationDuration: '4s' }}>
                                <FaCity className="text-2xl text-white" />
                            </div>
                            <h1 className="text-xl font-bold text-slate-800 tracking-tight">
                                {t("smart_city")}
                            </h1>
                            <p className="text-slate-400 text-sm mt-1">
                                {t("admin_login")}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit(signIn)} className="space-y-4">
                            {/* Email */}
                            <div>
                                <div className="relative group">
                                    <FaEnvelope className="absolute top-1/2 -translate-y-1/2 left-3.5 text-slate-300 group-focus-within:text-primary transition-colors text-sm" />
                                    <input
                                        type="email"
                                        placeholder={t("admin_email")}
                                        className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all text-sm bg-white/80
                                        ${errors.email ? "border-red-300" : "border-slate-200"}`}
                                        {...register("email")}
                                    />
                                </div>
                                {errors.email && (
                                    <p className="mt-1.5 text-xs text-red-500 font-medium">
                                        {errors.email.message}
                                    </p>
                                )}
                            </div>

                            {/* Password */}
                            <div>
                                <div className="relative group">
                                    <FaLock className={`absolute top-1/2 -translate-y-1/2 ${isRtl ? 'right-3.5' : 'left-3.5'} text-slate-300 group-focus-within:text-primary transition-colors text-sm`} />
                                    <input
                                        type={showPass ? "text" : "password"}
                                        placeholder={t("password")}
                                        className={`w-full ${isRtl ? 'pr-10 pl-10' : 'pl-10 pr-10'} py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all text-sm bg-white/80
                                        ${errors.password ? "border-red-300" : "border-slate-200"}`}
                                        {...register("password")}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPass(!showPass)}
                                        className={`absolute top-1/2 -translate-y-1/2 ${isRtl ? 'left-3' : 'right-3'} text-slate-400 hover:text-slate-600 transition cursor-pointer z-10`}
                                    >
                                        {showPass ? <FaEyeSlash className="text-xs" /> : <FaEye className="text-xs" />}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="mt-1.5 text-xs text-red-500 font-medium">
                                        {errors.password.message}
                                    </p>
                                )}
                            </div>

                            {/* Error Alert */}
                            {apiError && (
                                <div className="rounded-xl border border-red-200/70 bg-red-50 px-4 py-2.5 text-xs text-red-700 font-medium flex items-center gap-2 animate-fadeInDown">
                                    <div className="h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />
                                    {apiError}
                                </div>
                            )}

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading || isSubmitting}
                                className="w-full bg-gradient-to-r from-primary to-emerald-600 hover:from-primary-hover hover:to-emerald-700 disabled:opacity-60 text-white py-3 rounded-xl font-bold shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="spinner" />
                                        {t("logging_in")}
                                    </>
                                ) : (
                                    t("login")
                                )}
                            </button>

                            <p className="text-center text-sm">
                                <Link to="/reset-password" className="text-primary hover:text-primary-hover hover:underline font-semibold transition">
                                    {t("forgot_password")}
                                </Link>
                            </p>

                            <p className="text-center text-xs text-slate-300 mt-6 select-none font-medium">
                                © 2026 {t("system_name")}
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
