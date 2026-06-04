import { useMemo, useState, useEffect } from "react";
import {
    collection,
    onSnapshot,
    query,
    where,
    deleteDoc,
    doc,
    setDoc,
    getDocs
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { db, firebaseConfig } from "../firebase/firebase";
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { useTranslation } from "react-i18next";
import { FaSearch, FaTrash, FaPlus, FaUserCog, FaInbox, FaEye, FaEyeSlash, FaUsers, FaUserCheck, FaUserClock, FaUserTimes } from "react-icons/fa";
import Badge from "../Components/Badge";
import StatCard from "../Components/StatCard";

export default function TechnicalsPage() {
    const { t, i18n } = useTranslation();
    const isRtl = i18n.language === "ar";
    const navigate = useNavigate();
    const [q, setQ] = useState("");
    const [status, setStatus] = useState("All");
    const [workers, setWorkers] = useState([]);

    const [showPass, setShowPass] = useState(false);



    useEffect(() => {
        const qRef = query(
            collection(db, "users"),
            where("role", "==", "technical")
        );
        const unsubscribe = onSnapshot(qRef, (snapshot) => {
            const data = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setWorkers(data);
        });
        return () => unsubscribe();
    }, []);

    const filtered = useMemo(() => {
        return workers.filter((w) => {
            const matchQ =
                q.trim() === "" ||
                `${w.name} ${w.phone} ${w.area}`
                    .toLowerCase()
                    .includes(q.toLowerCase());
            const matchStatus = status === "All" ? true : w.status === status;
            return matchQ && matchStatus;
        });
    }, [workers, q, status]);

    const stats = useMemo(() => {
        const total = workers.length;
        const available = workers.filter((w) => w.status?.toLowerCase() === "available").length;
        const active = workers.filter((w) => w.status?.toLowerCase() === "active").length;
        const offline = workers.filter((w) => w.status?.toLowerCase() === "offline").length;

        return [
            {
                title: t("total_workers"),
                value: total,
                icon: <FaUsers />,
                bgClass: "bg-primary/10 text-primary border-primary/20",
            },
            {
                title: t("available"),
                value: available,
                icon: <FaUserCheck />,
                bgClass: "bg-green-50 text-green-600 border-green-200/60",
            },
            {
                title: t("active"),
                value: active,
                icon: <FaUserClock />,
                bgClass: "bg-blue-50 text-blue-600 border-blue-200/60",
            },
            {
                title: t("offline"),
                value: offline,
                icon: <FaUserTimes />,
                bgClass: "bg-red-50 text-red-600 border-red-200/60",
            },
        ];
    }, [workers, t]);

    const [open, setOpen] = useState(false);
    const [newWorker, setNewWorker] = useState({
        name: "",
        phone: "",
        area: "",
        status: "Available",
        email: "",
        password: "",
    });

    async function addWorker(e) {
        e.preventDefault();
        if (!newWorker.name || !newWorker.phone || !newWorker.area || !newWorker.email || !newWorker.password) return;

        const tempApp = initializeApp(firebaseConfig, "TempTechnicalApp");
        const tempAuth = getAuth(tempApp);

        try {
            const userCred = await createUserWithEmailAndPassword(
                tempAuth,
                newWorker.email,
                newWorker.password
            );
            const user = userCred.user;

            await setDoc(doc(db, "users", user.uid), {
                name: newWorker.name,
                phone: newWorker.phone,
                area: newWorker.area,
                status: newWorker.status,
                tasks: 0,
                role: "technical",
                email: newWorker.email,
            });

            setNewWorker({
                name: "",
                phone: "",
                area: "",
                status: "Available",
                email: "",
                password: "",
            });
            setOpen(false);
        } catch (err) {
            alert(err.message);
        } finally {
            await tempApp.delete();
        }
    }

    async function deleteWorker(id) {
        const ok = confirm(t("delete_worker_confirm"));
        if (!ok) return;
        await deleteDoc(doc(db, "users", id));
    }

    const statusFilters = [
        { key: "All", label: t("all_status") },
        { key: "Available", label: t("available") },
        { key: "Active", label: t("active") },
        { key: "Offline", label: t("offline") },
    ];

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-fadeInUp">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                        {t("technicals")}
                    </h1>
                    <p className="text-sm text-slate-500 mt-0.5">
                        {t("technicals_desc")}
                    </p>
                </div>

                <div className="flex gap-2 flex-wrap items-center">
                    <button
                        onClick={() => {
                            setNewWorker({
                                name: "",
                                phone: "",
                                area: "",
                                status: "Available",
                                email: "",
                                password: "",
                            });
                            setOpen(true);
                        }}
                        className="rounded-xl bg-primary hover:bg-primary-hover text-white px-4 py-2 text-sm font-semibold transition-all shadow-sm hover:shadow-md flex items-center gap-2"
                    >
                        <FaPlus className="text-xs" />
                        {t("add_technical")}
                    </button>

                    <div className="relative">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 text-xs" />
                        <input
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder={t("search_worker")}
                            className="w-full md:w-56 rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                        />
                    </div>

                    <div className="flex rounded-xl border border-slate-200/80 overflow-hidden bg-slate-50/50">
                        {statusFilters.map((f) => (
                            <button
                                key={f.key}
                                onClick={() => setStatus(f.key)}
                                className={`px-3 py-2 text-xs font-medium transition-all duration-200
                                    ${status === f.key
                                        ? "bg-primary text-white shadow-sm"
                                        : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                                    }`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* KPI Cards */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, idx) => (
                    <div
                        key={idx}
                        className={`animate-fadeInUp stagger-${idx + 1}`}
                    >
                        <StatCard {...stat} />
                    </div>
                ))}
            </section>

            {/* Table */}
            <div className="rounded-2xl glass-card-strong overflow-hidden animate-fadeInUp stagger-2">
                <div className="grid grid-cols-12 border-b border-slate-100/80 bg-slate-50/60 px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    <div className="col-span-4 text-start">{t("worker")}</div>
                    <div className="col-span-3 text-start">{t("contact")}</div>
                    <div className="col-span-2 text-start">{t("status")}</div>
                    <div className="col-span-2 text-start">{t("area")}</div>
                    <div className="col-span-1 text-end">{t("action")}</div>
                </div>

                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                        <FaInbox className="text-4xl mb-3 text-slate-300" />
                        <p className="text-sm font-medium">{t("no_workers")}</p>
                    </div>
                ) : (
                    filtered.map((w, idx) => (
                        <div
                            key={w.id}
                            className="grid grid-cols-12 px-5 py-4 items-center animate-fadeIn"
                            style={{ animationDelay: `${Math.min(idx * 40, 320)}ms` }}
                        >
                            <div className="col-span-4 flex items-center gap-3">
                                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-sm">
                                    {(w.name || "?").charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                    <p className="font-semibold text-slate-900 text-sm truncate">{w.name}</p>
                                    <p className="text-[10px] text-slate-400 truncate font-mono">ID: {w.id.slice(0, 8)}…</p>
                                </div>
                            </div>

                            <div className="col-span-3">
                                <p className="text-sm text-slate-700">{w.phone}</p>
                            </div>

                            <div className="col-span-2">
                                <Badge tone={w.status === "Available" ? "success" : w.status === "Active" ? "info" : "neutral"}>
                                    {t(w.status.toLowerCase())}
                                </Badge>
                            </div>

                            <div className="col-span-2">
                                <p className="text-sm text-slate-600 truncate">{w.area}</p>
                            </div>

                            <div className="col-span-1 flex justify-end">
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteWorker(w.id);
                                    }}
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
                    className="fixed inset-0 z-[99999] bg-slate-900/40 flex items-center justify-center p-4 animate-overlayIn"
                    onClick={() => setOpen(false)}
                >
                    <div
                        className="w-full max-w-md rounded-2xl glass-card-strong shadow-2xl p-6 sm:p-8 relative animate-modalIn"
                        onClick={(e) => e.stopPropagation()}
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
                                <FaUserCog />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">
                                    {t("add_technical")}
                                </h2>
                                <p className="text-xs text-slate-400">
                                    {t("create_worker")}
                                </p>
                            </div>
                        </div>

                        {/* Form */}
                        <form onSubmit={addWorker} className="space-y-3">
                            <div>
                                <label className="text-[11px] text-slate-400 mb-1 block font-medium uppercase tracking-wider">
                                    {t("name")}
                                </label>
                                <input
                                    value={newWorker.name}
                                    onChange={(e) => setNewWorker(p => ({ ...p, name: e.target.value }))}
                                    placeholder={t("name")}
                                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="text-[11px] text-slate-400 mb-1 block font-medium uppercase tracking-wider">
                                    {t("phone")}
                                </label>
                                <input
                                    value={newWorker.phone}
                                    onChange={(e) => setNewWorker(p => ({ ...p, phone: e.target.value }))}
                                    placeholder={t("phone")}
                                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="text-[11px] text-slate-400 mb-1 block font-medium uppercase tracking-wider">
                                    {t("area")}
                                </label>
                                <input
                                    value={newWorker.area}
                                    onChange={(e) => setNewWorker(p => ({ ...p, area: e.target.value }))}
                                    placeholder={t("area")}
                                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="text-[11px] text-slate-400 mb-1 block font-medium uppercase tracking-wider">
                                    {t("email")}
                                </label>
                                <input
                                    value={newWorker.email}
                                    onChange={(e) => setNewWorker(p => ({ ...p, email: e.target.value }))}
                                    placeholder={t("email")}
                                    autoComplete="off"
                                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="text-[11px] text-slate-400 mb-1 block font-medium uppercase tracking-wider">
                                    {t("password")}
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPass ? "text" : "password"}
                                        value={newWorker.password}
                                        onChange={(e) => setNewWorker(p => ({ ...p, password: e.target.value }))}
                                        placeholder={t("password")}
                                        autoComplete="new-password"
                                        className={`w-full rounded-xl border border-slate-200 ${isRtl ? 'pr-3 pl-10' : 'pl-3 pr-10'} py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none transition-all`}
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
                                    {t("status")}
                                </label>
                                <select
                                    value={newWorker.status}
                                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none bg-white transition-all"
                                    onChange={(e) => setNewWorker(p => ({ ...p, status: e.target.value }))}
                                >
                                    <option value="Available">{t("available")}</option>
                                    <option value="Active">{t("active")}</option>
                                    <option value="Offline">{t("offline")}</option>
                                </select>
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

