import { Outlet, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../Context/AuthContext";
import Sidebar from "../Components/Sidebar";

export default function MainLayout() {
    const { setIsLoggedIn } = useContext(AuthContext);
    const navigate = useNavigate();

    function logout() {
        localStorage.removeItem("token");
        setIsLoggedIn(false);
        navigate("/login", { replace: true });
    }

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            {/* Sidebar ثابت */}
            <div className="shrink-0">
                <Sidebar logout={logout} />
            </div>

            {/* المحتوى هو اللي يscroll */}
            <main className="flex-1 min-w-0 overflow-auto p-6">
                <Outlet />
            </main>
        </div>
    );
}