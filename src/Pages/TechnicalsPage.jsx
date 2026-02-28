import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function TechnicalsPage() {
    const navigate = useNavigate();
    const [q, setQ] = useState("");
    const [status, setStatus] = useState("All");

    // ✅ بدل useMemo -> useState علشان نقدر نضيف/نمسح
    const [workers, setWorkers] = useState(() => [
        { id: "w1", name: "Ahmed Hassan", phone: "01000000001", status: "Available", tasks: 0, area: "Cairo" },
        { id: "w2", name: "Mona Ali", phone: "01000000002", status: "Active", tasks: 3, area: "Giza" },
        { id: "w3", name: "Omar Said", phone: "01000000003", status: "Available", tasks: 1, area: "Cairo" },
        { id: "w4", name: "Salma Adel", phone: "01000000004", status: "Offline", tasks: 0, area: "Damietta" },
    ]);

    // Modal add
    const [open, setOpen] = useState(false);
    const [newWorker, setNewWorker] = useState({
        name: "",
        phone: "",
        area: "",
        status: "Available",
    });

    const filtered = useMemo(() => {
        return workers.filter((w) => {
            const matchQ =
                q.trim() === "" ||
                `${w.name} ${w.phone} ${w.area}`.toLowerCase().includes(q.toLowerCase());

            const matchStatus = status === "All" ? true : w.status === status;
            return matchQ && matchStatus;
        });
    }, [workers, q, status]);

    function addWorker(e) {
        e.preventDefault();

        if (!newWorker.name.trim() || !newWorker.phone.trim() || !newWorker.area.trim()) return;

        const id = `w${Date.now()}`;
        setWorkers((prev) => [
            {
                id,
                name: newWorker.name.trim(),
                phone: newWorker.phone.trim(),
                area: newWorker.area.trim(),
                status: newWorker.status,
                tasks: 0,
            },
            ...prev,
        ]);

        setNewWorker({ name: "", phone: "", area: "", status: "Available" });
        setOpen(false);
    }

    function deleteWorker(id) {
        const ok = confirm("Delete this technical worker?");
        if (!ok) return;
        setWorkers((prev) => prev.filter((w) => w.id !== id));
    }

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Technicals</h1>
                    <p className="text-sm text-slate-500">Manage technical workers and their workload.</p>
                </div>

                <div className="flex gap-2 flex-wrap">
                    <button
                        onClick={() => setOpen(true)}
                        className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 text-sm font-semibold"
                    >
                        + Add Technical
                    </button>

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

            {/* Table */}
            <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
                <div className="grid grid-cols-12 border-b bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-600">
                    <div className="col-span-4">Worker</div>
                    <div className="col-span-3">Contact</div>
                    <div className="col-span-2">Status</div>
                    <div className="col-span-1">Tasks</div>
                    <div className="col-span-1">Area</div>
                    <div className="col-span-1 text-right">Action</div>
                </div>

                {filtered.length === 0 ? (
                    <div className="p-6 text-sm text-slate-500">No workers found.</div>
                ) : (
                    filtered.map((w) => (
                        <button
                            key={w.id}
                            onClick={() => navigate(`/technicals/${w.id}`)}
                            className="w-full text-left grid grid-cols-12 px-4 py-4 border-b hover:bg-slate-50 transition items-center"
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

                            <div className="col-span-1">
                                <p className="text-sm text-slate-700">{w.area}</p>
                            </div>

                            <div className="col-span-1 flex justify-end">
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation(); // ✅ عشان مايفتحش details
                                        deleteWorker(w.id);
                                    }}
                                    className="rounded-xl border border-red-200 bg-red-50 text-red-700 px-3 py-1.5 text-xs hover:bg-red-100"
                                >
                                    Delete
                                </button>
                            </div>
                        </button>
                    ))
                )}
            </div>

            {/* ✅ Modal Add */}
            {open && (
                <div
                    className="fixed inset-0 z-[99999] bg-black/60 flex items-center justify-center p-4"
                    onClick={() => setOpen(false)}
                >
                    <div
                        className="w-full max-w-md rounded-2xl bg-white border shadow-lg p-5"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start justify-between">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">Add Technical</h2>
                                <p className="text-xs text-slate-500">Create a new worker (mock).</p>
                            </div>
                            <button onClick={() => setOpen(false)} className="text-slate-500 hover:text-slate-900">
                                ✕
                            </button>
                        </div>

                        <form onSubmit={addWorker} className="mt-4 space-y-3">
                            <div>
                                <label className="text-xs text-slate-500">Name</label>
                                <input
                                    value={newWorker.name}
                                    onChange={(e) => setNewWorker((p) => ({ ...p, name: e.target.value }))}
                                    className="mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                                    placeholder="Worker name"
                                />
                            </div>

                            <div>
                                <label className="text-xs text-slate-500">Phone</label>
                                <input
                                    value={newWorker.phone}
                                    onChange={(e) => setNewWorker((p) => ({ ...p, phone: e.target.value }))}
                                    className="mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                                    placeholder="010xxxxxxxx"
                                />
                            </div>

                            <div>
                                <label className="text-xs text-slate-500">Area</label>
                                <input
                                    value={newWorker.area}
                                    onChange={(e) => setNewWorker((p) => ({ ...p, area: e.target.value }))}
                                    className="mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                                    placeholder="Cairo / Giza ..."
                                />
                            </div>

                            <div>
                                <label className="text-xs text-slate-500">Status</label>
                                <select
                                    value={newWorker.status}
                                    onChange={(e) => setNewWorker((p) => ({ ...p, status: e.target.value }))}
                                    className="mt-1 w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                                >
                                    <option value="Available">Available</option>
                                    <option value="Active">Active</option>
                                    <option value="Offline">Offline</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                className="w-full rounded-xl bg-slate-900 hover:bg-slate-800 text-white py-2 text-sm font-semibold"
                            >
                                Add
                            </button>
                        </form>
                    </div>
                </div>
            )}
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

    return (
        <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs ${cls}`}>
            {children}
        </span>
    );
}