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
            <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 sm:p-8 mx-auto">
                {!sent ? (
                    <>
                        {/* Header */}
                        <div className="text-center mb-6">
                            <FaCity className="text-5xl text-blue-600 mx-auto mb-2" />
                            <h1 className="text-2xl font-bold text-gray-800">
                                Reset Password
                            </h1>
                            <p className="text-gray-500 text-sm">
                                Enter admin email to receive reset link
                            </p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="relative">
                                <FaEnvelope className="absolute top-3 left-3 text-gray-400" />
                                <input
                                    type="email"
                                    placeholder="Admin Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition"
                            >
                                Send Reset Link
                            </button>

                            <Link
                                to="/login"
                                className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition"
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
                        <h2 className="text-xl font-bold text-gray-800">
                            Email Sent Successfully
                        </h2>
                        <p className="text-gray-500 text-sm">
                            We have sent a password reset link to:
                        </p>
                        <p className="font-semibold text-gray-700">{email}</p>

                        <Link
                            to="/login"
                            className="inline-flex items-center gap-2 mt-4 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-semibold transition"
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
