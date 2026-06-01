import { useState } from "react";
import { FaEnvelope, FaArrowLeft, FaCity, FaCheckCircle } from "react-icons/fa";
import { Link } from "react-router-dom";
import bg from "./../assets/bg.png";

export default function ResetPasswordPage() {
    const [email, setEmail] = useState("");
    const [sent, setSent] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Reset password for:", email);
        setSent(true);
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center bg-cover bg-center relative px-4 sm:px-6 lg:px-8"
            style={{ backgroundImage: `url(${bg})` }}
        >
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/40"></div>

            {/* Card */}
            <div className="relative bg-white/90 backdrop-blur-md border border-white/20 w-full max-w-md rounded-3xl shadow-2xl p-8 mx-auto">
                {!sent ? (
                    <>
                        {/* Header */}
                        <div className="text-center mb-6">
                            <FaCity className="text-5xl text-primary mx-auto mb-3" />
                            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                                Reset Password
                            </h1>
                            <p className="text-slate-500 text-sm mt-1">
                                Enter admin email to receive reset link
                            </p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="relative">
                                <FaEnvelope className="absolute top-4 left-3.5 text-slate-400" />
                                <input
                                    type="email"
                                    placeholder="Admin Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white/80 text-sm transition-all duration-200"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-primary hover:bg-primary-hover text-white py-3 rounded-xl font-bold shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
                            >
                                Send Reset Link
                            </button>

                            <Link
                                to="/login"
                                className="flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-primary font-bold transition"
                            >
                                <FaArrowLeft />
                                Back to Login
                            </Link>
                        </form>
                    </>
                ) : (
                    /* Success Message */
                    <div className="text-center space-y-4">
                        <FaCheckCircle className="text-6xl text-green-500 mx-auto" />
                        <h2 className="text-xl font-bold text-slate-800">
                            Email Sent Successfully
                        </h2>
                        <p className="text-slate-500 text-sm">
                            We have sent a password reset link to:
                        </p>
                        <p className="font-bold text-slate-700">{email}</p>

                            <Link
                                to="/login"
                            className="inline-flex items-center gap-2 mt-4 bg-primary hover:bg-primary-hover text-white px-5 py-3 rounded-xl font-bold shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
                        >
                                <FaArrowLeft />
                                Back to Login
                            </Link>
                        </div>
                )}
            </div>
        </div>
    );
}
