import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ReportsPage() {
    const navigate = useNavigate();
    const [q, setQ] = useState("");
    const [status, setStatus] = useState("All");
    const [priority, setPriority] = useState("All");

    // 🔸 Mock Data (استبدلها بـ API later)
    const reports = useMemo(
        () => [
            {
                id: "1",
                title: "Garbage Overflow",
                category: "Garbage",
                status: "New",
                priority: "High",
                city: "Cairo",
                street: "Tahrir St",
                createdAt: "2026-02-28 12:30",
            },
            {
                id: "2",
                title: "Road Pothole",
                category: "Road",
                status: "In Progress",
                priority: "Medium",
                city: "Giza",
                street: "Haram St",
                createdAt: "2026-02-28 13:10",
            },
            {
                id: "3",
                title: "Bin Sensor Alert",
                category: "IoT",
                status: "Completed",
                priority: "Low",
                city: "Cairo",
                street: "Nasr City",
                createdAt: "2026-02-28 14:05",
            },
        ],
        []
    );

    const filtered = useMemo(() => {
        return reports.filter((r) => {
            const matchQ =
                q.trim() === "" ||
                `${r.title} ${r.city} ${r.street} ${r.category}`.toLowerCase().includes(q.toLowerCase());

            const matchStatus = status === "All" ? true : r.status === status;
            const matchPriority = priority === "All" ? true : r.priority === priority;

            return matchQ && matchStatus && matchPriority;
        });
    }, [reports, q, status, priority]);

    return (
        <div className="space-y-5">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
                    <p className="text-sm text-slate-500">Manage incoming reports and assign workers.</p>
                </div>

                <div className="flex gap-2 flex-wrap">
                    <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Search (title, city, street...)"
                        className="w-full md:w-72 rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                    />

                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                    >
                        <option value="All">All Status</option>
                        <option value="New">New</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                    </select>

                    <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                        className="rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                    >
                        <option value="All">All Priority</option>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                    </select>
                </div>
            </div>

            <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
                <div className="grid grid-cols-12 border-b bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-600">
                    <div className="col-span-5">Report</div>
                    <div className="col-span-2">Status</div>
                    <div className="col-span-2">Priority</div>
                    <div className="col-span-3">Location / Time</div>
                </div>

                {filtered.length === 0 ? (
                    <div className="p-6 text-sm text-slate-500">No reports found.</div>
                ) : (
                    filtered.map((r) => (
                        <button
                            key={r.id}
                            onClick={() => navigate(`/reports/${r.id}`)}
                            className="w-full text-left grid grid-cols-12 px-4 py-4 border-b hover:bg-slate-50 transition"
                        >
                            <div className="col-span-5">
                                <p className="font-semibold text-slate-900">{r.title}</p>
                                <p className="text-xs text-slate-500">{r.category}</p>
                            </div>

                            <div className="col-span-2">
                                <Badge tone={r.status === "Completed" ? "success" : r.status === "In Progress" ? "info" : "warn"}>
                                    {r.status}
                                </Badge>
                            </div>

                            <div className="col-span-2">
                                <Badge tone={r.priority === "High" ? "danger" : r.priority === "Medium" ? "warn" : "neutral"}>
                                    {r.priority}
                                </Badge>
                            </div>

                            <div className="col-span-3">
                                <p className="text-sm text-slate-700">
                                    {r.city}, {r.street}
                                </p>
                                <p className="text-xs text-slate-500">{r.createdAt}</p>
                            </div>
                        </button>
                    ))
                )}
            </div>
        </div>
    );
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

    return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs ${cls}`}>{children}</span>;
}