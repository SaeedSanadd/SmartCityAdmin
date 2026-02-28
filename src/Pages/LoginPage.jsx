import { FaCity, FaLock, FaEnvelope } from "react-icons/fa";
import bg from "./../assets/bg.png";
import * as zod from "zod";
import React, { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { sendLoginData } from "../Services/login";
import { AuthContext } from "../Context/AuthContext";

const schema = zod.object({
    email: zod
        .string()
        .nonempty("Email is required")
        .regex(
            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            "Please enter a valid email address"
        ),
    password: zod
        .string()
        .nonempty("Password is required")
        .regex(
            /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/,
            "Password must be at least 8 characters and include an uppercase letter, a lowercase letter, and a number"
        ),
});

export default function LoginPage() {
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

    async function signIn(values) {
        setApiError(null);
        setLoading(true);
        console.log("VALUES:", values);
        try {
            const result = await sendLoginData(values);
            console.log("RESULT:", result);
            if (result?.error) {
                setApiError(result.error);
                return;
            }

            const token = result?.data?.token;
            if (!token) {
                setApiError("Token not found");
                return;
            }

            localStorage.setItem("token", token);
            setIsLoggedIn(true);

            navigate("/", { replace: true }); // ✅ لأن الداشبورد عندك index على "/"
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
                <div className="text-center mb-6">
                    <FaCity className="text-5xl text-blue-600 mx-auto mb-2" />
                    <h1 className="text-2xl font-bold text-gray-800">
                        Smart City Management
                    </h1>
                    <p className="text-gray-500 text-sm">Admin Login Panel</p>
                </div>

                {/* ✅ هنا التعديل المهم */}
                <form onSubmit={handleSubmit(signIn)} className="space-y-5">
                    {/* Email */}
                    <div className="relative">
                        <FaEnvelope className="absolute top-3 left-3 text-gray-400" />
                        <input
                            type="email"
                            placeholder="Admin Email"
                            autoComplete="off"
                            className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition
                ${errors.email ? "border-red-400 focus:ring-red-400" : "focus:ring-blue-500"}`}
                            {...register("email")}
                        />
                        {errors.email && (
                            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                        )}
                    </div>

                    {/* Password */}
                    <div className="relative">
                        <FaLock className="absolute top-3 left-3 text-gray-400" />
                        <input
                            type="password"
                            placeholder="Password"
                            autoComplete="new-password"
                            className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition
                ${errors.password ? "border-red-400 focus:ring-red-400" : "focus:ring-blue-500"}`}
                            {...register("password")}
                        />
                        {errors.password && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.password.message}
                            </p>
                        )}
                    </div>

                    {/* API Error */}
                    {apiError && (
                        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                            {apiError}
                        </div>
                    )}

                    {/* Button */}
                    <button
                        type="submit"
                        disabled={loading || isSubmitting}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white py-2 rounded-lg font-semibold transition"
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>

                    <p className="text-center text-sm">
                        <Link to="/reset-password" className="text-blue-600 hover:underline">
                            Forgot Password?
                        </Link>
                    </p>

                    <p className="text-center text-sm text-gray-500 mt-4 select-none">
                        © 2026 Smart City System
                    </p>
                </form>
            </div>
        </div>
    );
}
