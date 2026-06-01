import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useTranslation } from "react-i18next";
import { FaSearch, FaChevronRight, FaInbox } from "react-icons/fa";
import Badge, { statusTone, priorityTone } from "../Components/Badge";

export default function ReportsPage() {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const [reports, setReports] = useState([]);
    const [q, setQ] = useState("");
    const [status, setStatus] = useState("All");
    const [priority, setPriority] = useState("All");

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "reports"), (snapshot) => {
            const data = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setReports(data);
        });
        return () => unsubscribe();
    }, []);

    const filtered = useMemo(() => {
        return reports.filter((r) => {
            const matchQ =
                q.trim() === "" ||
                `${r.type ?? ""} ${r.city ?? ""} ${r.address ?? ""} ${r.notes ?? ""}`
                    .toLowerCase()
                    .includes(q.toLowerCase());
            const matchStatus = status === "All" ? true : r.status === status;
            const matchPriority = priority === "All" ? true : r.priority === priority;
            return matchQ && matchStatus && matchPriority;
        });
    }, [reports, q, status, priority]);

    const formatDate = (timestamp) => {
        if (!timestamp) return "";
        try {
            return timestamp.toDate().toLocaleString();
        } catch {
            return "";
        }
    };

    const statusFilters = [
        { key: "All", label: t("all_status") },
        { key: "pending", label: t("pending") },
        { key: "in_progress", label: t("in_progress") },
        { key: "resolved", label: t("resolved") },
    ];

    const priorityFilters = [
        { key: "All", label: t("all_priority") },
        { key: "High", label: t("high") },
        { key: "Medium", label: t("medium") },
        { key: "Low", label: t("low") },
    ];

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-fadeInUp">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                        {t("reports")}
                    </h1>
                    <p className="text-sm text-slate-500 mt-0.5">
                        {t("reports_desc")}
                    </p>
                </div>

                <div className="flex gap-2 flex-wrap items-center">
                    {/* Search */}
                    <div className="relative">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 text-xs" />
                        <input
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder={t("search_placeholder")}
                            className="w-full md:w-64 rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                        />
                    </div>

                    {/* Status pills */}
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

                    {/* Priority pills */}
                    <div className="flex rounded-xl border border-slate-200/80 overflow-hidden bg-slate-50/50">
                        {priorityFilters.map((f) => (
                            <button
                                key={f.key}
                                onClick={() => setPriority(f.key)}
                                className={`px-3 py-2 text-xs font-medium transition-all duration-200
                                    ${priority === f.key
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

            {/* Table */}
            <div className="rounded-2xl glass-card-strong overflow-hidden animate-fadeInUp stagger-2">
                <div className="grid grid-cols-12 border-b border-slate-100/80 bg-slate-50/60 px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    <div className="col-span-5 text-start">{t("report")}</div>
                    <div className="col-span-2 text-start">{t("status")}</div>
                    <div className="col-span-2 text-start">{t("priority")}</div>
                    <div className="col-span-3 text-start">{t("location_time")}</div>
                </div>

                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                        <FaInbox className="text-4xl mb-3 text-slate-300" />
                        <p className="text-sm font-medium">{t("no_reports")}</p>
                        <p className="text-xs text-slate-300 mt-1">Try adjusting your filters</p>
                    </div>
                ) : (
                    filtered.map((r, idx) => (
                        <button
                            key={r.id}
                            onClick={() => navigate(`/reports/${r.id}`)}
                            className={`w-full text-start grid grid-cols-12 px-5 py-4 items-center table-row-hover group animate-fadeIn stagger-${Math.min(idx + 1, 8)}`}
                            style={{ animationDelay: `${Math.min(idx * 40, 320)}ms` }}
                        >
                            <div className="col-span-5 flex items-center gap-3">
                                <div className="h-9 w-9 rounded-lg bg-primary/8 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                                    {(r.type || "R").charAt(0)}
                                </div>
                                <div className="min-w-0">
                                    <p className="font-semibold text-slate-900 text-sm truncate">
                                        {r.type}
                                    </p>
                                    <p className="text-xs text-slate-400 truncate">
                                        {r.city}
                                    </p>
                                </div>
                            </div>

                            <div className="col-span-2">
                                <Badge tone={statusTone(r.status)}>
                                    {r.status}
                                </Badge>
                            </div>

                            <div className="col-span-2">
                                <Badge tone={priorityTone(r.priority)}>
                                    {r.priority ?? "—"}
                                </Badge>
                            </div>

                            <div className="col-span-3 flex items-center justify-between">
                                <div className="min-w-0">
                                    <p className="text-sm text-slate-700 truncate">
                                        {r.address}
                                    </p>
                                    <p className="text-xs text-slate-400">
                                        {formatDate(r.createdAt)}
                                    </p>
                                </div>
                                <FaChevronRight className="text-slate-300 text-xs shrink-0 group-hover:text-primary transition-colors ml-2" />
                            </div>
                        </button>
                    ))
                )}
            </div>
        </div>
    );
}
