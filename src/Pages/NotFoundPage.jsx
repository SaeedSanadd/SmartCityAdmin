import { FaCity, FaHome, FaExclamationTriangle } from "react-icons/fa";
import { Link } from "react-router-dom";
import bg from "./../assets/bg.png";

export default function NotFoundPage() {
    return (
        <div
            className="min-h-screen flex items-center justify-center bg-cover bg-center relative px-4"
            style={{ backgroundImage: `url(${bg})` }}
        >
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/50"></div>

            {/* Card */}
            <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl p-8 text-center">
                <FaCity className="text-5xl text-blue-600 mx-auto mb-4" />

                <h1 className="text-6xl font-extrabold text-gray-800 mb-2">
                    404
                </h1>

                <div className="flex items-center justify-center gap-2 text-yellow-500 mb-3">
                    <FaExclamationTriangle />
                    <p className="font-semibold">Page Not Found</p>
                </div>

                <p className="text-gray-500 text-sm mb-6">
                    The page you are trying to access does not exist or has been
                    moved.
                </p>

                <Link
                    to="/login"
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-semibold transition"
                >
                    <FaHome />
                    Back to Login
                </Link>

                <p className="text-xs text-gray-400 mt-6 select-none">
                    © 2026 Smart City Management System
                </p>
            </div>
        </div>
    );
}
