import { useEffect, useMemo, useState } from "react";
import {
    FaClipboardList,
    FaClock,
    FaCheckCircle,
    FaExclamationTriangle,
} from "react-icons/fa";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/firebase";
import CityMap from "../Components/CityMap";
import StatCard from "../Components/StatCard";
import { useTranslation } from "react-i18next";

export default function Dashboard() {
    const [reports, setReports] = useState([]);
    const [statusFilter, setStatusFilter] = useState("All");
    const [priorityFilter, setPriorityFilter] = useState("All");
    const { t } = useTranslation();

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

    const filteredReports = useMemo(() => {
        return reports.filter((r) => {
            const statusOk = statusFilter === "All" ? true : r.status === statusFilter;
            const prioOk = priorityFilter === "All" ? true : r.priority === priorityFilter;
            return statusOk && prioOk;
        });
    }, [reports, statusFilter, priorityFilter]);

    const kpis = useMemo(() => {
        const total = reports.length;
        const newReports = reports.filter((r) => r.status === "pending").length;
        const inProgress = reports.filter((r) => r.status === "in_progress").length;
        const completed = reports.filter((r) => r.status === "resolved").length;
        const highPriority = reports.filter((r) => r.priority === "High").length;

        return [
            {
                title: t("total_reports"),
                value: total,
                icon: <FaClipboardList />,
                bgClass: "bg-primary/10 text-primary border-primary/20",
            },
            {
                title: t("new_unassigned"),
                value: newReports,
                icon: <FaExclamationTriangle />,
                bgClass: "bg-amber-50 text-amber-600 border-amber-200/60",
            },
            {
                title: t("in_progress"),
                value: inProgress,
                icon: <FaClock />,
                bgClass: "bg-blue-50 text-blue-600 border-blue-200/60",
            },
            {
                title: t("completed"),
                value: completed,
                icon: <FaCheckCircle />,
                bgClass: "bg-green-50 text-green-600 border-green-200/60",
            },
            {
                title: t("high_priority_ai"),
                value: highPriority,
                icon: <FaExclamationTriangle />,
                bgClass: "bg-red-50 text-red-600 border-red-200/60",
            },
        ];
    }, [reports, t]);

    // Greeting based on time of day
    const hour = new Date().getHours();
    const greetingKey = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";

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
        <div className="space-y-6">
            {/* Header */}
            <header className="animate-fadeInUp">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                    {greetingKey} 👋
                </h1>
                <p className="text-sm text-slate-500 mt-0.5">
                    {t("dashboard_desc")}
                </p>
            </header>

            {/* KPI Cards */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {kpis.map((stat, idx) => (
                    <div
                        key={idx}
                        className={`animate-fadeInUp stagger-${idx + 1}`}
                    >
                        <StatCard {...stat} />
                    </div>
                ))}
            </section>

            {/* Map */}
            <section className="rounded-2xl glass-card-strong overflow-hidden animate-fadeInUp stagger-6">
                <div className="px-5 py-4 border-b border-slate-100/80 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                        <h2 className="font-bold text-slate-900 text-base">
                            {t("city_map")}
                        </h2>
                        <p className="text-xs text-slate-400 mt-0.5">
                            {t("map_desc")}
                        </p>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                        {/* Status Filter Pills */}
                        <div className="flex rounded-xl border border-slate-200/80 overflow-hidden bg-slate-50/50">
                            {statusFilters.map((f) => (
                                <button
                                    key={f.key}
                                    onClick={() => setStatusFilter(f.key)}
                                    className={`px-3 py-1.5 text-xs font-medium transition-all duration-200
                                        ${statusFilter === f.key
                                            ? "bg-primary text-white shadow-sm"
                                            : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                                        }`}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>

                        {/* Priority Filter Pills */}
                        <div className="flex rounded-xl border border-slate-200/80 overflow-hidden bg-slate-50/50">
                            {priorityFilters.map((f) => (
                                <button
                                    key={f.key}
                                    onClick={() => setPriorityFilter(f.key)}
                                    className={`px-3 py-1.5 text-xs font-medium transition-all duration-200
                                        ${priorityFilter === f.key
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

                <div className="h-[40vh] sm:h-[50vh] lg:h-[60vh]">
                    <CityMap reports={filteredReports} />
                </div>
            </section>
        </div>
    );
}
