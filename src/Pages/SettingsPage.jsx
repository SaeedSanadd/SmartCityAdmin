import { useEffect, useState } from "react";
import { auth, db } from "../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
import { updatePassword, onAuthStateChanged } from "firebase/auth";
import { useTranslation } from "react-i18next";

export default function SettingsPage() {
    const { t, i18n } = useTranslation();

    const [admin, setAdmin] = useState(null);
    const [user, setUser] = useState(null);

    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");

    // 🔥 Language Toggle
    const toggleLang = () => {
        const newLang = i18n.language === "en" ? "ar" : "en";
        i18n.changeLanguage(newLang);
        localStorage.setItem("lang", newLang);
        document.documentElement.dir = newLang === "ar" ? "rtl" : "ltr";
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });

        return () => unsubscribe();
    }, []);

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
                console.error(error);
            }
        }

        fetchAdmin();
    }, [user]);

    async function changePassword() {
        if (!password || !confirm) {
            alert(t("fill_fields"));
            return;
        }

        if (password !== confirm) {
            alert(t("passwords_not_match"));
            return;
        }

        if (password.length < 6) {
            alert(t("password_short"));
            return;
        }

        try {
            await updatePassword(user, password);
            alert(t("password_updated"));
            setPassword("");
            setConfirm("");
        } catch (err) {
            alert(err.message);
        }
    }

    if (!admin) {
        return (
            <div className="flex justify-center items-center h-[70vh] text-gray-500">
                {t("loading")}
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 px-4 py-10">
            <div className="mx-auto max-w-4xl">

                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">
                            {t("settings")}
                        </h1>
                        <p className="mt-2 text-gray-500">
                            {t("settings_desc")}
                        </p>
                    </div>

                    {/* 🌐 Language Button */}
                    <button
                        onClick={toggleLang}
                        className="px-4 py-2 rounded-xl bg-white border shadow-sm text-sm hover:bg-gray-50"
                    >
                        {i18n.language === "en" ? "AR" : "EN"}
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

                    {/* PROFILE */}
                    <div className="lg:col-span-1">
                        <div className="rounded-3xl bg-white shadow-lg border p-6 text-center hover:shadow-xl transition">

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
                        <div className="rounded-3xl bg-white shadow-lg border p-6 hover:shadow-xl transition">

                            <h3 className="text-xl font-bold mb-4">
                                {t("security")}
                            </h3>

                            <div className="space-y-4">

                                <input
                                    type="password"
                                    placeholder={t("new_password")}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-200"
                                />

                                <input
                                    type="password"
                                    placeholder={t("confirm_password")}
                                    value={confirm}
                                    onChange={(e) => setConfirm(e.target.value)}
                                    className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-200"
                                />

                                <button
                                    onClick={changePassword}
                                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 text-white py-3 rounded-xl font-semibold transition"
                                >
                                    {t("update_password")}
                                </button>

                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
