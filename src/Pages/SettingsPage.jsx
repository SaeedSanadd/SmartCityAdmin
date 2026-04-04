import { useEffect, useState } from "react";
import { auth, db } from "../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
import { updatePassword, onAuthStateChanged } from "firebase/auth";

export default function SettingsPage() {
    const [admin, setAdmin] = useState(null);
    const [user, setUser] = useState(null);

    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");

    // 🔥 GET CURRENT USER FIRST
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });

        return () => unsubscribe();
    }, []);

    // 🔥 GET ADMIN DATA FROM FIRESTORE
    useEffect(() => {
        async function fetchAdmin() {
            if (!user) return;

            try {
                const ref = doc(db, "admins", user.uid);
                const snap = await getDoc(ref);

                if (snap.exists()) {
                    setAdmin(snap.data());
                }
            } catch (error) {
                console.error("Error fetching admin:", error);
            }
        }

        fetchAdmin();
    }, [user]);

    // 🔐 CHANGE PASSWORD
    async function changePassword() {
        if (!password || !confirm) {
            alert("Please fill in all fields");
            return;
        }

        if (password !== confirm) {
            alert("Passwords do not match");
            return;
        }

        if (password.length < 6) {
            alert("Password must be at least 6 characters");
            return;
        }

        try {
            await updatePassword(user, password);
            alert("Password updated successfully");
            setPassword("");
            setConfirm("");
        } catch (err) {
            alert(err.message);
        }
    }

    // 🔄 LOADING STATE
    if (!admin) {
        return (
            <div className="flex justify-center items-center h-[70vh] text-gray-500">
                Loading...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 px-4 py-10">
            <div className="mx-auto max-w-4xl">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
                    <p className="mt-2 text-gray-500">
                        Manage your account information and security settings
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

                    {/* PROFILE */}
                    <div className="lg:col-span-1">
                        <div className="rounded-3xl bg-white shadow-lg border p-6 text-center">

                            <div className="mb-4 flex h-24 w-24 mx-auto items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-3xl font-bold text-white">
                                {admin.name?.charAt(0).toUpperCase()}
                            </div>

                            <h2 className="text-xl font-bold text-gray-800">
                                {admin.name}
                            </h2>

                            <p className="text-gray-500 text-sm mt-1">
                                {admin.email}
                            </p>

                        </div>
                    </div>

                    {/* SECURITY */}
                    <div className="lg:col-span-2">
                        <div className="rounded-3xl bg-white shadow-lg border p-6">

                            <h3 className="text-xl font-bold mb-4">Security</h3>

                            <div className="space-y-4">

                                <input
                                    type="password"
                                    placeholder="New Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full border rounded-xl px-4 py-3"
                                />

                                <input
                                    type="password"
                                    placeholder="Confirm Password"
                                    value={confirm}
                                    onChange={(e) => setConfirm(e.target.value)}
                                    className="w-full border rounded-xl px-4 py-3"
                                />

                                <button
                                    onClick={changePassword}
                                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold"
                                >
                                    Update Password
                                </button>

                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}