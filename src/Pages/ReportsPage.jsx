import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useTranslation } from "react-i18next";

export default function ReportsPage() {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const [reports, setReports] = useState([]);
    const [q, setQ] = useState("");
    const [status, setStatus] = useState("All");
    const [priority, setPriority] = useState("All");

    // 🔥 Real-time Firestore
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

    // 🔥 Filtering
    const filtered = useMemo(() => {
        return reports.filter((r) => {
            const matchQ =
                q.trim() === "" ||
                `${r.type ?? ""} ${r.city ?? ""} ${r.address ?? ""} ${r.notes ?? ""}`
                    .toLowerCase()
                    .includes(q.toLowerCase());

            const matchStatus =
                status === "All" ? true : r.status === status;

            const matchPriority =
                priority === "All" ? true : r.priority === priority;

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

    return (
        <div className="space-y-5">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        {t("reports")}
                    </h1>
                    <p className="text-sm text-slate-500">
                        {t("reports_desc")}
                    </p>
                </div>

                <div className="flex gap-2 flex-wrap">
                    <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder={t("search_placeholder")}
                        className="w-full md:w-72 rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                    />

                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                    >
                        <option value="All">{t("all_status")}</option>
                        <option value="pending">{t("pending")}</option>
                        <option value="in_progress">{t("in_progress")}</option>
                        <option value="resolved">{t("resolved")}</option>
                    </select>

                    <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                        className="rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                    >
                        <option value="All">{t("all_priority")}</option>
                        <option value="High">{t("high")}</option>
                        <option value="Medium">{t("medium")}</option>
                        <option value="Low">{t("low")}</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">

                <div className="grid grid-cols-12 border-b bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-600">
                    <div className="col-span-5">{t("report")}</div>
                    <div className="col-span-2">{t("status")}</div>
                    <div className="col-span-2">{t("priority")}</div>
                    <div className="col-span-3">{t("location_time")}</div>
                </div>

                {filtered.length === 0 ? (
                    <div className="p-6 text-sm text-slate-500">
                        {t("no_reports")}
                    </div>
                ) : (
                    filtered.map((r) => (
                        <button
                            key={r.id}
                            onClick={() => navigate(`/reports/${r.id}`)}
                            className="w-full text-left grid grid-cols-12 px-4 py-4 border-b hover:bg-slate-50 transition"
                        >
                            <div className="col-span-5">
                                <p className="font-semibold text-slate-900">
                                    {r.type}
                                </p>
                                <p className="text-xs text-slate-500">
                                    {r.city}
                                </p>
                            </div>

                            <div className="col-span-2">
                                <Badge tone={statusTone(r.status)}>
                                    {r.status}
                                </Badge>
                            </div>

                            <div className="col-span-2">
                                <Badge
                                    tone={
                                        r.priority === "High"
                                            ? "danger"
                                            : r.priority === "Medium"
                                                ? "warn"
                                                : "neutral"
                                    }
                                >
                                    {r.priority ?? "—"}
                                </Badge>
                            </div>

                            <div className="col-span-3">
                                <p className="text-sm text-slate-700">
                                    {r.address}
                                </p>
                                <p className="text-xs text-slate-500">
                                    {formatDate(r.createdAt)}
                                </p>
                            </div>
                        </button>
                    ))
                )}
            </div>
        </div>
    );
}

function statusTone(status) {
    if (status === "resolved") return "success";
    if (status === "in_progress") return "info";
    return "danger";
}

function Badge({ children, tone = "neutral" }) {
    const cls =
        tone === "danger"
            ? "bg-red-50 text-red-700 border-red-200"
            : tone === "success"
                ? "bg-green-50 text-green-700 border-green-200"
                : tone === "info"
                    ? "bg-blue-50 text-blue-700 border-blue-200"
                    : tone === "warn"
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : "bg-slate-50 text-slate-700 border-slate-200";

    return (
        <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs ${cls}`}>
            {children}
        </span>
    );
}
