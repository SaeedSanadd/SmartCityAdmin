import { FaCity, FaLock, FaEnvelope } from "react-icons/fa";
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

    const { setIsLoggedIn } = useContext(AuthContext);
    const navigate = useNavigate();

    const {
        handleSubmit,
        register,
        formState: { errors, isSubmitting },
    } = useForm({
        defaultValues: {
            email: "",
            password: "",
        },
        resolver: zodResolver(schema),
        mode: "onTouched",
    });

    // 🌐 Language toggle
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
            <div className="absolute inset-0 bg-black/40"></div>

            <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 sm:p-8 mx-auto">

                {/* 🌐 Language Button */}
                <div className="flex justify-end mb-2">
                    <button
                        onClick={toggleLang}
                        className="text-xs px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 border"
                    >
                        {i18n.language === "en" ? "AR" : "EN"}
                    </button>
                </div>

                <div className="text-center mb-6">
                    <FaCity className="text-5xl text-blue-600 mx-auto mb-2" />
                    <h1 className="text-2xl font-bold text-gray-800">
                        {t("smart_city")}
                    </h1>
                    <p className="text-gray-500 text-sm">
                        {t("admin_login")}
                    </p>
                </div>

                <form onSubmit={handleSubmit(signIn)} className="space-y-5">

                    <div className="relative">
                        <FaEnvelope className="absolute top-3 left-3 text-gray-400" />

                        <input
                            type="email"
                            placeholder={t("admin_email")}
                            className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2
                            ${errors.email ? "border-red-400" : "focus:ring-blue-500"}`}
                            {...register("email")}
                        />

                        {errors.email && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.email.message}
                            </p>
                        )}
                    </div>

                    <div className="relative">
                        <FaLock className="absolute top-3 left-3 text-gray-400" />

                        <input
                            type="password"
                            placeholder={t("password")}
                            className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2
                            ${errors.password ? "border-red-400" : "focus:ring-blue-500"}`}
                            {...register("password")}
                        />

                        {errors.password && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.password.message}
                            </p>
                        )}
                    </div>

                    {apiError && (
                        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                            {apiError}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading || isSubmitting}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-2 rounded-lg font-semibold"
                    >
                        {loading ? t("logging_in") : t("login")}
                    </button>

                    <p className="text-center text-sm">
                        <Link to="/reset-password" className="text-blue-600 hover:underline">
                            {t("forgot_password")}
                        </Link>
                    </p>

                    <p className="text-center text-sm text-gray-500 mt-4">
                        © 2026 {t("system_name")}
                    </p>

                </form>
            </div>
        </div>
    );
}
