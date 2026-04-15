import { useEffect, useMemo, useState } from "react";
import {
    FaClipboardList,
    FaClock,
    FaCheckCircle,
    FaExclamationTriangle,
    FaHardHat,
} from "react-icons/fa";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/firebase";
import CityMap from "../Components/CityMap";
import StatCard from "../Components/StatCard";
import { useTranslation } from "react-i18next";

export default function Dashboard() {
    // 🔥 Firebase Reports State
    const [reports, setReports] = useState([]);

    // Filters
    const [statusFilter, setStatusFilter] = useState("All");
    const [priorityFilter, setPriorityFilter] = useState("All");
    const { t } = useTranslation();

    // 🔥 Real-time Firestore Listener
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

    // 🔥 Filtering Reports
    const filteredReports = useMemo(() => {
        return reports.filter((r) => {
            const statusOk =
                statusFilter === "All" ? true : r.status === statusFilter;
            const prioOk =
                priorityFilter === "All" ? true : r.priority === priorityFilter;
            return statusOk && prioOk;
        });
    }, [reports, statusFilter, priorityFilter]);

    // 🔥 KPIs
    const kpis = useMemo(() => {
        const total = reports.length;
        const newReports = reports.filter((r) => r.status === "pending").length;
        const inProgress = reports.filter(
            (r) => r.status === "in_progress"
        ).length;
        const completed = reports.filter(
            (r) => r.status === "resolved"
        ).length;
        const highPriority = reports.filter(
            (r) => r.priority === "High"
        ).length;

        return [
            {
                title: t("total_reports"),
                value: total,
                icon: <FaClipboardList className="text-indigo-500" />,
            },
            {
                title: t("new_unassigned"),
                value: newReports,
                icon: <FaExclamationTriangle className="text-amber-500" />,
            },
            {
                title: t("in_progress"),
                value: inProgress,
                icon: <FaClock className="text-blue-500" />,
            },
            {
                title: t("completed"),
                value: completed,
                icon: <FaCheckCircle className="text-green-500" />,
            },
            {
                title: t("high_priority_ai"),
                value: highPriority,
                icon: <FaExclamationTriangle className="text-red-500" />,
            },
        ];
    }, [reports, t]);

    const highPriorityCount = reports.filter(
        (r) => r.priority === "High"
    ).length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">
                        {t("dashboard")}
                    </h1>

                    <p className="text-sm text-slate-500">
                        {t("dashboard_desc")}
                    </p>
                </div>
            </header>

            {/* KPI Cards */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {kpis.map((stat, idx) => (
                    <div
                        key={idx}
                        className="rounded-2xl border bg-white shadow-sm hover:shadow-md transition"
                    >
                        <StatCard {...stat} />
                    </div>
                ))}
            </section>

            {/* Map */}
            <section className="rounded-2xl border bg-white shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                        <h2 className="font-semibold text-slate-900">
                            {t("city_map")}
                        </h2>

                        <p className="text-xs text-slate-500">
                            {t("map_desc")}
                        </p>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                        <Select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="All">{t("all_status")}</option>
                            <option value="pending">{t("pending")}</option>
                            <option value="in_progress">{t("in_progress")}</option>
                            <option value="resolved">{t("resolved")}</option>
                        </Select>

                        <Select
                            value={priorityFilter}
                            onChange={(e) => setPriorityFilter(e.target.value)}
                        >
                            <option value="All">{t("all_priority")}</option>
                            <option value="High">{t("high")}</option>
                            <option value="Medium">{t("medium")}</option>
                            <option value="Low">{t("low")}</option>
                        </Select>
                    </div>
                </div>

                {/* 🔥 Responsive Map Height */}
                <div className="h-[40vh] sm:h-[50vh] lg:h-[60vh]">
                    <CityMap reports={filteredReports} />
                </div>
            </section>
        </div>
    );
}

function Pill({ label, tone = "info" }) {
    const styles =
        tone === "danger"
            ? "bg-red-50 text-red-700 border-red-200"
            : "bg-blue-50 text-blue-700 border-blue-200";

    return (
        <span className={`text-xs px-3 py-1.5 rounded-full border ${styles}`}>
            {label}
        </span>
    );
}

function Select({ children, ...props }) {
    return (
        <select
            {...props}
            className="text-sm bg-white border rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-200"
        >
            {children}
        </select>
    );
}
