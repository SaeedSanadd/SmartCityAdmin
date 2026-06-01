import { useMemo, useState, useEffect } from "react";
import {
    collection,
    onSnapshot,
    deleteDoc,
    doc,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import { setDoc } from "firebase/firestore";
import {
    createUserWithEmailAndPassword,
    signOut
} from "firebase/auth";
import { auth } from "../firebase/firebase";
import { useTranslation } from "react-i18next";
import { FaSearch, FaTrash, FaPlus, FaUserShield, FaInbox } from "react-icons/fa";

export default function AdminsPage() {
    const { t } = useTranslation();

    const [q, setQ] = useState("");
    const [admins, setAdmins] = useState([]);
    const [open, setOpen] = useState(false);

    const [newAdmin, setNewAdmin] = useState({
        name: "",
        email: "",
        password: "",
    });

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "admins"), (snapshot) => {
            const data = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setAdmins(data);
        });
        return () => unsubscribe();
    }, []);

    const filtered = useMemo(() => {
        return admins.filter((a) =>
            `${a.name} ${a.email}`.toLowerCase().includes(q.toLowerCase())
        );
    }, [admins, q]);

    async function addAdmin(e) {
        e.preventDefault();
        if (!newAdmin.name || !newAdmin.email || !newAdmin.password) return;

        try {
            const userCred = await createUserWithEmailAndPassword(
                auth,
                newAdmin.email,
                newAdmin.password
            );
            const user = userCred.user;

            await setDoc(doc(db, "admins", user.uid), {
                uid: user.uid,
                name: newAdmin.name,
                email: newAdmin.email,
                role: "admin",
            });

            await signOut(auth);

            setNewAdmin({ name: "", email: "", password: "" });
            setOpen(false);
        } catch (error) {
            alert(error.message);
        }
    }

    async function deleteAdmin(id) {
        const ok = confirm(t("delete_admin_confirm"));
        if (!ok) return;
        await deleteDoc(doc(db, "admins", id));
    }

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-fadeInUp">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                        {t("admins")}
                    </h1>
                    <p className="text-sm text-slate-500 mt-0.5">
                        {t("admins_desc")}
                    </p>
                </div>

                <div className="flex gap-2 flex-wrap items-center">
                    <button
                        onClick={() => {
                            setNewAdmin({ name: "", email: "", password: "" });
                            setOpen(true);
                        }}
                        className="rounded-xl bg-primary hover:bg-primary-hover text-white px-4 py-2 text-sm font-semibold transition-all shadow-sm hover:shadow-md flex items-center gap-2"
                    >
                        <FaPlus className="text-xs" />
                        {t("add_admin")}
                    </button>

                    <div className="relative">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 text-xs" />
                        <input
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder={t("search_admin")}
                            className="w-full md:w-64 rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="rounded-2xl glass-card-strong overflow-hidden animate-fadeInUp stagger-2">
                <div className="grid grid-cols-12 border-b border-slate-100/80 bg-slate-50/60 px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    <div className="col-span-5 text-start">{t("admin")}</div>
                    <div className="col-span-5 text-start">{t("email")}</div>
                    <div className="col-span-2 text-end">{t("actions")}</div>
                </div>

                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                        <FaInbox className="text-4xl mb-3 text-slate-300" />
                        <p className="text-sm font-medium">No admins found.</p>
                    </div>
                ) : (
                    filtered.map((a, idx) => (
                        <div
                            key={a.id}
                            className="grid grid-cols-12 px-5 py-4 items-center table-row-hover animate-fadeIn"
                            style={{ animationDelay: `${Math.min(idx * 40, 320)}ms` }}
                        >
                            <div className="col-span-5 flex items-center gap-3">
                                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-primary-hover text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-sm">
                                    {(a.name || "?").charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                    <p className="font-semibold text-slate-900 text-sm truncate">{a.name}</p>
                                    <p className="text-[10px] text-slate-400 truncate font-mono">ID: {a.id.slice(0, 8)}…</p>
                                </div>
                            </div>

                            <div className="col-span-5 text-start">
                                <p className="text-sm text-slate-600 truncate">{a.email}</p>
                            </div>

                            <div className="col-span-2 flex justify-end">
                                <button
                                    onClick={() => deleteAdmin(a.id)}
                                    className="h-8 w-8 rounded-lg flex items-center justify-center border border-red-200/60 bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 transition-all duration-200"
                                    title={t("delete")}
                                >
                                    <FaTrash className="text-xs" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal */}
            {open && (
                <div
                    onClick={() => setOpen(false)}
                    className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-900/40 p-4 animate-overlayIn"
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-md rounded-2xl glass-card-strong shadow-2xl p-6 sm:p-8 relative animate-modalIn"
                    >
                        {/* Close */}
                        <button
                            onClick={() => setOpen(false)}
                            className="absolute top-4 end-4 text-slate-400 hover:text-slate-600 text-lg transition"
                        >
                            ✕
                        </button>

                        {/* Title */}
                        <div className="flex items-center gap-3 mb-5">
                            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                <FaUserShield />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">
                                    {t("add_admin")}
                                </h2>
                                <p className="text-xs text-slate-400">
                                    {t("admins_desc")}
                                </p>
                            </div>
                        </div>

                        {/* Form */}
                        <form onSubmit={addAdmin} className="space-y-3">
                            <div>
                                <label className="text-[11px] text-slate-400 mb-1 block font-medium uppercase tracking-wider">
                                    {t("name")}
                                </label>
                                <input
                                    value={newAdmin.name}
                                    onChange={(e) => setNewAdmin((p) => ({ ...p, name: e.target.value }))}
                                    placeholder={t("name")}
                                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="text-[11px] text-slate-400 mb-1 block font-medium uppercase tracking-wider">
                                    {t("email")}
                                </label>
                                <input
                                    value={newAdmin.email}
                                    onChange={(e) => setNewAdmin((p) => ({ ...p, email: e.target.value }))}
                                    placeholder={t("email")}
                                    autoComplete="off"
                                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="text-[11px] text-slate-400 mb-1 block font-medium uppercase tracking-wider">
                                    {t("password")}
                                </label>
                                <input
                                    type="password"
                                    value={newAdmin.password}
                                    onChange={(e) => setNewAdmin((p) => ({ ...p, password: e.target.value }))}
                                    placeholder={t("password")}
                                    autoComplete="new-password"
                                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none transition-all"
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setOpen(false)}
                                    className="w-full rounded-xl border border-slate-200 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition font-medium"
                                >
                                    {t("cancel") || "Cancel"}
                                </button>

                                <button
                                    type="submit"
                                    className="w-full rounded-xl bg-primary hover:bg-primary-hover text-white py-2.5 text-sm font-semibold shadow-sm hover:shadow-md transition-all"
                                >
                                    {t("add")}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
