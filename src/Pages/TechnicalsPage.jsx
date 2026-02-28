import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function TechnicalsPage() {
    const navigate = useNavigate();
    const [q, setQ] = useState("");
    const [status, setStatus] = useState("All");

    const workers = useMemo(
        () => [
            { id: "w1", name: "Ahmed Hassan", phone: "01000000001", status: "Available", tasks: 0, area: "Cairo" },
            { id: "w2", name: "Mona Ali", phone: "01000000002", status: "Active", tasks: 3, area: "Giza" },
            { id: "w3", name: "Omar Said", phone: "01000000003", status: "Available", tasks: 1, area: "Cairo" },
            { id: "w4", name: "Salma Adel", phone: "01000000004", status: "Offline", tasks: 0, area: "Damietta" },
        ],
        []
    );

    const filtered = useMemo(() => {
        return workers.filter((w) => {
            const matchQ =
                q.trim() === "" ||
                `${w.name} ${w.phone} ${w.area}`.toLowerCase().includes(q.toLowerCase());

            const matchStatus = status === "All" ? true : w.status === status;
            return matchQ && matchStatus;
        });
    }, [workers, q, status]);

    return (
        <div className="space-y-5">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Technicals</h1>
                    <p className="text-sm text-slate-500">Manage technical workers and their workload.</p>
                </div>

                <div className="flex gap-2 flex-wrap">
                    <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Search (name / phone / area)"
                        className="w-full md:w-72 rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                    />

                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                    >
                        <option value="All">All Status</option>
                        <option value="Available">Available</option>
                        <option value="Active">Active</option>
                        <option value="Offline">Offline</option>
                    </select>
                </div>
            </div>

            <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
                <div className="grid grid-cols-12 border-b bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-600">
                    <div className="col-span-4">Worker</div>
                    <div className="col-span-3">Contact</div>
                    <div className="col-span-2">Status</div>
                    <div className="col-span-1">Tasks</div>
                    <div className="col-span-2">Area</div>
                </div>

                {filtered.length === 0 ? (
                    <div className="p-6 text-sm text-slate-500">No workers found.</div>
                ) : (
                    filtered.map((w) => (
                        <button
                            key={w.id}
                            onClick={() => navigate(`/technicals/${w.id}`)}
                            className="w-full text-left grid grid-cols-12 px-4 py-4 border-b hover:bg-slate-50 transition"
                        >
                            <div className="col-span-4">
                                <p className="font-semibold text-slate-900">{w.name}</p>
                                <p className="text-xs text-slate-500">ID: {w.id}</p>
                            </div>

                            <div className="col-span-3">
                                <p className="text-sm text-slate-700">{w.phone}</p>
                            </div>

                            <div className="col-span-2">
                                <Badge tone={w.status === "Available" ? "success" : w.status === "Active" ? "info" : "neutral"}>
                                    {w.status}
                                </Badge>
                            </div>

                            <div className="col-span-1">
                                <span className="text-sm font-semibold text-slate-900">{w.tasks}</span>
                            </div>

                            <div className="col-span-2">
                                <p className="text-sm text-slate-700">{w.area}</p>
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
        tone === "success"
            ? "bg-green-50 text-green-700 border-green-200"
            : tone === "info"
                ? "bg-blue-50 text-blue-700 border-blue-200"
                : "bg-slate-50 text-slate-700 border-slate-200";

    return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs ${cls}`}>{children}</span>;
}