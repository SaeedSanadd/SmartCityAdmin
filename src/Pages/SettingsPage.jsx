import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../Context/AuthContext";

export default function SettingsPage() {
    const { setIsLoggedIn } = useContext(AuthContext);
    const navigate = useNavigate();

    const [passwords, setPasswords] = useState({
        current: "",
        newPass: "",
        confirm: "",
    });

    function changePassword(e) {
        e.preventDefault();

        if (!passwords.current || !passwords.newPass || !passwords.confirm) {
            alert("Please fill all fields");
            return;
        }

        if (passwords.newPass !== passwords.confirm) {
            alert("Passwords do not match");
            return;
        }

        // 🔥 هنا بعدين تعمل API call
        alert("Password changed successfully (mock)");

        setPasswords({ current: "", newPass: "", confirm: "" });
    }

    function logout() {
        localStorage.removeItem("token");
        setIsLoggedIn(false);
        navigate("/login", { replace: true });
    }

    return (
        <div className="max-w-xl space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
                <p className="text-sm text-slate-500">
                    Manage your account security.
                </p>
            </div>

            {/* Change Password */}
            <div className="rounded-2xl border bg-white shadow-sm p-5">
                <h2 className="font-semibold text-slate-900">Change Password</h2>

                <form onSubmit={changePassword} className="mt-4 space-y-3">
                    <input
                        type="password"
                        placeholder="Current Password"
                        value={passwords.current}
                        onChange={(e) =>
                            setPasswords((p) => ({ ...p, current: e.target.value }))
                        }
                        className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                    />

                    <input
                        type="password"
                        placeholder="New Password"
                        value={passwords.newPass}
                        onChange={(e) =>
                            setPasswords((p) => ({ ...p, newPass: e.target.value }))
                        }
                        className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                    />

                    <input
                        type="password"
                        placeholder="Confirm New Password"
                        value={passwords.confirm}
                        onChange={(e) =>
                            setPasswords((p) => ({ ...p, confirm: e.target.value }))
                        }
                        className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                    />

                    <button
                        type="submit"
                        className="w-full rounded-xl bg-slate-900 hover:bg-slate-800 text-white py-2 text-sm font-semibold"
                    >
                        Update Password
                    </button>
                </form>
            </div>

            {/* Logout */}
            <div className="rounded-2xl border bg-white shadow-sm p-5">
                <h2 className="font-semibold text-slate-900">Session</h2>

                <button onClick={logout}
                    className="mt-4 w-full rounded-xl bg-red-600 hover:bg-red-700 text-white py-2 text-sm font-semibold">
                    Logout
                </button>
            </div>
        </div>
    );
}