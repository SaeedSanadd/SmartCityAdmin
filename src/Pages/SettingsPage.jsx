import { useEffect, useState } from "react";
import { auth, db } from "../firebase/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { updatePassword, onAuthStateChanged } from "firebase/auth";
import { useTranslation } from "react-i18next";
import { FaLock, FaGlobe, FaShieldAlt, FaEye, FaEyeSlash } from "react-icons/fa";

export default function SettingsPage() {
    const { t, i18n } = useTranslation();

    const [admin, setAdmin] = useState(null);
    const [user, setUser] = useState(null);

    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");

    const [isEditing, setIsEditing] = useState(false);
    const [editedName, setEditedName] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [showConfirmPass, setShowConfirmPass] = useState(false);
    const isRtl = i18n.language === "ar";



    async function handleUpdateProfile() {
        if (!editedName.trim()) {
            alert(t("fill_fields"));
            return;
        }
        try {
            const ref = doc(db, "admins", user.uid);
            await updateDoc(ref, { name: editedName });
            setAdmin({ ...admin, name: editedName });
            setIsEditing(false);
            alert(t("profile_updated") || "Profile updated successfully!");
        } catch (error) {
            console.error(error);
            alert(error.message);
        }
    }

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
                    const data = snap.data();
                    setAdmin(data);
                    setEditedName(data.name || "");
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
            <div className="flex justify-center items-center h-[70vh]">
                <div className="flex flex-col items-center gap-3">
                    <div className="spinner !border-primary/30 !border-t-primary !w-8 !h-8" />
                    <p className="text-sm text-slate-400">{t("loading")}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fadeInUp">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                        {t("settings")}
                    </h1>
                    <p className="text-sm text-slate-500 mt-0.5">
                        {t("settings_desc")}
                    </p>
                </div>

                <button
                    onClick={toggleLang}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 shadow-sm text-sm hover:bg-slate-50 hover:shadow-md transition-all font-medium text-slate-600"
                >
                    <FaGlobe className="text-primary/60 text-xs" />
                    {i18n.language === "en" ? "AR" : "EN"}
                </button>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* PROFILE */}
                <div className="lg:col-span-1 animate-fadeInUp stagger-2">
                    <div className="rounded-2xl glass-card-strong p-6 text-center hover-lift">
                        <div className="relative mx-auto mb-4">
                            <div className="h-24 w-24 mx-auto rounded-full bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-primary/20">
                                {admin.name?.charAt(0).toUpperCase()}
                            </div>
                            <div className="absolute bottom-0 right-1/2 translate-x-[40px] h-5 w-5 rounded-full bg-emerald-500 border-[3px] border-white" />
                        </div>

                        {isEditing ? (
                            <div className="space-y-3 mt-4 text-start">
                                <div>
                                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                                        {t("name")}
                                    </label>
                                    <input
                                        value={editedName}
                                        onChange={(e) => setEditedName(e.target.value)}
                                        className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-white"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleUpdateProfile}
                                        className="w-full bg-primary hover:bg-primary-hover text-white py-2 rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer"
                                    >
                                        {t("save_changes") || "Save"}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setEditedName(admin.name || "");
                                            setIsEditing(false);
                                        }}
                                        className="w-full border border-slate-200 text-slate-500 hover:bg-slate-50 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer bg-white"
                                    >
                                        {t("cancel")}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <h2 className="text-lg font-bold text-slate-900 tracking-tight mt-4">
                                    {admin.name}
                                </h2>

                                <p className="text-slate-400 text-sm mt-0.5">
                                    {admin.email}
                                </p>

                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="mt-4 w-full bg-slate-100 hover:bg-slate-200/80 text-slate-600 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border border-slate-200/30"
                                >
                                    {t("edit_profile") || "Edit Profile"}
                                </button>
                            </>
                        )}

                        <div className="mt-4 pt-4 border-t border-slate-100">
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 rounded-full px-3 py-1">
                                <FaShieldAlt className="text-[9px]" />
                                Admin
                            </span>
                        </div>
                    </div>
                </div>

                {/* SECURITY */}
                <div className="lg:col-span-2 animate-fadeInUp stagger-3">
                    <div className="rounded-2xl glass-card-strong p-6 hover-lift">
                        <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                                <FaLock className="text-xs" />
                            </div>
                            {t("security")}
                        </h3>
                        <p className="text-xs text-slate-400 mb-5">Update your password to keep your account secure</p>

                        <div className="space-y-4">
                             <div>
                                <label className="text-[11px] text-slate-400 mb-1 block font-medium uppercase tracking-wider">
                                    {t("new_password")}
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPass ? "text" : "password"}
                                        placeholder={t("new_password")}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className={`w-full border border-slate-200 rounded-xl ${isRtl ? 'pr-4 pl-10' : 'pl-4 pr-10'} py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none transition-all`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPass(!showPass)}
                                        className={`absolute top-1/2 -translate-y-1/2 ${isRtl ? 'left-3' : 'right-3'} text-slate-400 hover:text-slate-600 transition cursor-pointer z-10`}
                                    >
                                        {showPass ? <FaEyeSlash className="text-xs" /> : <FaEye className="text-xs" />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="text-[11px] text-slate-400 mb-1 block font-medium uppercase tracking-wider">
                                    {t("confirm_password")}
                                </label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPass ? "text" : "password"}
                                        placeholder={t("confirm_password")}
                                        value={confirm}
                                        onChange={(e) => setConfirm(e.target.value)}
                                        className={`w-full border border-slate-200 rounded-xl ${isRtl ? 'pr-4 pl-10' : 'pl-4 pr-10'} py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none transition-all`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPass(!showConfirmPass)}
                                        className={`absolute top-1/2 -translate-y-1/2 ${isRtl ? 'left-3' : 'right-3'} text-slate-400 hover:text-slate-600 transition cursor-pointer z-10`}
                                    >
                                        {showConfirmPass ? <FaEyeSlash className="text-xs" /> : <FaEye className="text-xs" />}
                                    </button>
                                </div>
                            </div>

                            <button
                                onClick={changePassword}
                                className="w-full bg-gradient-to-r from-primary to-emerald-600 hover:from-primary-hover hover:to-emerald-700 text-white py-3 rounded-xl font-semibold shadow-sm hover:shadow-md transition-all"
                            >
                                {t("update_password")}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
