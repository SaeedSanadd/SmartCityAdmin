import { useMemo, useState } from "react";
import {
    FaClipboardList,
    FaClock,
    FaCheckCircle,
    FaExclamationTriangle,
    FaHardHat,
} from "react-icons/fa";

import CityMap from "../Components/CityMap";
import StatCard from "../Components/StatCard";

export default function Dashboard() {
    // Filters
    const [statusFilter, setStatusFilter] = useState("All");
    const [priorityFilter, setPriorityFilter] = useState("All");

    // Mock reports (بدّلها بـ API بعدين)
    const reports = useMemo(
        () => [
            { id: 1, lat: 30.0626, lng: 31.2497, title: "Garbage", status: "New", priority: "High", createdAt: "11:30AM" },
            { id: 2, lat: 30.05, lng: 31.23, title: "Road Issue", status: "In Progress", priority: "Medium", createdAt: "12:00PM" },
            { id: 3, lat: 30.0444, lng: 31.2357, title: "Power Outage", status: "Completed", priority: "Low", createdAt: "1:00PM" },
            { id: 4, lat: 30.058, lng: 31.255, title: "Bin Sensor Alert", status: "New", priority: "High", createdAt: "2:10PM" },
        ],
        []
    );

    // Mock workers
    const workers = useMemo(
        () => [
            { id: 1, name: "Ahmed", status: "Active" },
            { id: 2, name: "Mona", status: "Available" },
            { id: 3, name: "Omar", status: "Active" },
            { id: 4, name: "Salma", status: "Available" },
        ],
        []
    );

    const filteredReports = useMemo(() => {
        return reports.filter((r) => {
            const statusOk = statusFilter === "All" ? true : r.status === statusFilter;
            const prioOk = priorityFilter === "All" ? true : r.priority === priorityFilter;
            return statusOk && prioOk;
        });
    }, [reports, statusFilter, priorityFilter]);

    const kpis = useMemo(() => {
        const total = reports.length;
        const newReports = reports.filter((r) => r.status === "New").length;
        const inProgress = reports.filter((r) => r.status === "In Progress").length;
        const completed = reports.filter((r) => r.status === "Completed").length;
        const highPriority = reports.filter((r) => r.priority === "High").length;
        const activeWorkers = workers.filter((w) => w.status === "Active").length;

        return [
            { title: "Total Reports", value: total, icon: <FaClipboardList className="text-indigo-500" /> },
            { title: "New / Unassigned", value: newReports, icon: <FaExclamationTriangle className="text-amber-500" /> },
            { title: "In Progress", value: inProgress, icon: <FaClock className="text-blue-500" /> },
            { title: "Completed", value: completed, icon: <FaCheckCircle className="text-green-500" /> },
            { title: "High Priority (AI)", value: highPriority, icon: <FaExclamationTriangle className="text-red-500" /> },
            { title: "Active Workers", value: activeWorkers, icon: <FaHardHat className="text-purple-500" /> },
        ];
    }, [reports, workers]);

    const activeWorkers = workers.filter((w) => w.status === "Active").length;
    const availableWorkers = workers.filter((w) => w.status === "Available").length;
    const highPriorityCount = reports.filter((r) => r.priority === "High").length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
                    <p className="text-sm text-slate-500">
                        Track reports, prioritize urgent issues, and monitor city status.
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Pill label={`High Priority: ${highPriorityCount}`} tone="danger" />
                    <Pill label={`Active Workers: ${activeWorkers}`} tone="info" />
                    <Pill label={`Available: ${availableWorkers}`} tone="success" />
                </div>
            </header>

            {/* KPI Cards */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {kpis.map((stat, idx) => (
                    <div key={idx} className="rounded-2xl border bg-white shadow-sm hover:shadow-md transition">
                        <StatCard {...stat} />
                    </div>
                ))}
            </section>

            {/* Map Card */}
            <section className="rounded-2xl border bg-white shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                        <h2 className="font-semibold text-slate-900">City Map</h2>
                        <p className="text-xs text-slate-500">Filter markers by status and priority.</p>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                            <option value="All">All Status</option>
                            <option value="New">New</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                        </Select>

                        <Select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
                            <option value="All">All Priority</option>
                            <option value="High">High</option>
                            <option value="Medium">Medium</option>
                            <option value="Low">Low</option>
                        </Select>
                    </div>
                </div>

                <div className="h-[520px]">
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
            : tone === "success"
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-blue-50 text-blue-700 border-blue-200";

    return <span className={`text-xs px-3 py-1.5 rounded-full border ${styles}`}>{label}</span>;
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