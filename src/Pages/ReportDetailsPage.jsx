import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CityMap from "../Components/CityMap";

export default function ReportDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    // ✅ Lightbox (preview image)
    const [openImg, setOpenImg] = useState(null);

    // 🔸 Mock workers
    const workers = useMemo(
        () => [
            { id: "w1", name: "Ahmed Hassan", status: "Available" },
            { id: "w2", name: "Mona Ali", status: "Active" },
            { id: "w3", name: "Omar Said", status: "Available" },
        ],
        []
    );

    // 🔸 Mock reports
    const report = useMemo(() => {
        const all = [
            {
                id: "1",
                title: "Garbage Overflow",
                category: "Garbage",
                status: "New",
                priority: "High",
                description: "Trash bin is full and overflowed. Bad smell and insects.",
                lat: 30.0626,
                lng: 31.2497,
                city: "Cairo",
                street: "Tahrir St",
                images: [
                    "https://images.unsplash.com/photo-1528323273322-d81458248d40?w=1200&q=80",
                    "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1200&q=80",
                ],
                assignedTo: null,
                createdAt: "2026-02-28 12:30",
            },
            {
                id: "2",
                title: "Road Pothole",
                category: "Road",
                status: "In Progress",
                priority: "Medium",
                description: "Large pothole causing traffic and danger to cars.",
                lat: 30.05,
                lng: 31.23,
                city: "Giza",
                street: "Haram St",
                images: [],
                assignedTo: "w2",
                createdAt: "2026-02-28 13:10",
            },
        ];
        return all.find((x) => x.id === id);
    }, [id]);

    const [selectedWorker, setSelectedWorker] = useState(report?.assignedTo || "");
    const [status, setStatus] = useState(report?.status || "New");

    if (!report) {
        return (
            <div className="p-6 bg-white rounded-2xl border">
                <p className="text-slate-700">Report not found.</p>
                <button
                    onClick={() => navigate("/reports")}
                    className="mt-3 text-sm text-indigo-600 hover:underline"
                >
                    Back to Reports
                </button>
            </div>
        );
    }

    function assignWorker() {
        // ✅ later: PATCH /reports/:id/assign
        alert(`Assigned report ${report.id} to worker: ${selectedWorker || "None"}`);
    }

    function updateStatus() {
        // ✅ later: PATCH /reports/:id/status
        alert(`Updated status to: ${status}`);
    }

    return (
        <div className="space-y-6">
            {/* Top Header */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                    <button
                        onClick={() => navigate("/reports")}
                        className="text-sm text-indigo-600 hover:underline"
                    >
                        ← Back to Reports
                    </button>

                    <h1 className="mt-2 text-2xl font-bold text-slate-900">
                        {report.title}
                    </h1>

                    <p className="text-sm text-slate-500">
                        {report.city}, {report.street} • {report.createdAt}
                    </p>
                </div>

                <div className="flex gap-2">
                    <Badge
                        tone={
                            report.priority === "High"
                                ? "danger"
                                : report.priority === "Medium"
                                    ? "warn"
                                    : "neutral"
                        }
                    >
                        {report.priority}
                    </Badge>

                    <Badge
                        tone={
                            report.status === "Completed"
                                ? "success"
                                : report.status === "In Progress"
                                    ? "info"
                                    : "warn"
                        }
                    >
                        {report.status}
                    </Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Details */}
                <div className="lg:col-span-1 space-y-6">
                    <Card title="Description">
                        <p className="text-sm text-slate-700 leading-6">
                            {report.description}
                        </p>
                        <div className="mt-3 text-xs text-slate-500">
                            Category:{" "}
                            <span className="font-medium text-slate-700">
                                {report.category}
                            </span>
                        </div>
                    </Card>

                    <Card title="Assign to Worker">
                        <label className="text-xs text-slate-500">Select Worker</label>

                        <select
                            value={selectedWorker}
                            onChange={(e) => setSelectedWorker(e.target.value)}
                            className="mt-2 w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                        >
                            <option value="">Unassigned</option>
                            {workers.map((w) => (
                                <option key={w.id} value={w.id}>
                                    {w.name} ({w.status})
                                </option>
                            ))}
                        </select>

                        <button
                            onClick={assignWorker}
                            className="mt-3 w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-2"
                        >
                            Assign
                        </button>
                    </Card>

                    <Card title="Update Status">
                        <label className="text-xs text-slate-500">Status</label>

                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="mt-2 w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                        >
                            <option value="New">New</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                        </select>

                        <button
                            onClick={updateStatus}
                            className="mt-3 w-full rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold py-2"
                        >
                            Save Status
                        </button>
                    </Card>
                </div>

                {/* Right: Map + Images */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Map */}
                    <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
                        <div className="px-4 py-3 border-b">
                            <h2 className="font-semibold text-slate-900">Location</h2>
                            <p className="text-xs text-slate-500">
                                Report marker on the city map
                            </p>
                        </div>

                        <div className="h-[420px]">
                            <CityMap reports={[report]} />
                        </div>
                    </div>

                    {/* Images */}
                    <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
                        <div className="px-4 py-3 border-b flex items-center justify-between">
                            <div>
                                <h2 className="font-semibold text-slate-900">Images</h2>
                                <p className="text-xs text-slate-500">
                                    {report.images.length
                                        ? `${report.images.length} image(s) uploaded by citizen`
                                        : "No images"}
                                </p>
                            </div>

                            {report.images.length > 0 && (
                                <span className="text-xs rounded-full border px-2 py-1 bg-slate-50 text-slate-600">
                                    Click to preview
                                </span>
                            )}
                        </div>

                        {report.images.length === 0 ? (
                            <div className="p-6 text-sm text-slate-500">
                                No images attached to this report.
                            </div>
                        ) : (
                            <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {report.images.map((src, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => setOpenImg(src)}
                                        className="group relative overflow-hidden rounded-xl border bg-slate-50 aspect-square"
                                        aria-label={`Open image ${idx + 1}`}
                                    >
                                        <img
                                            src={src}
                                            alt={`report-${report.id}-${idx}`}
                                            className="w-full h-full object-cover transition duration-300 group-hover:scale-[1.03]"
                                            loading="lazy"
                                        />

                                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-black/30" />
                                        <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition">
                                            <span className="text-xs text-white bg-black/40 px-2 py-1 rounded-lg">
                                                Preview
                                            </span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ✅ Lightbox Modal */}
            {openImg && (
                <div
                    className="fixed inset-0 z-[99999] bg-black/70 flex items-center justify-center p-4"
                    onClick={() => setOpenImg(null)}
                >
                    <div
                        className="relative max-w-4xl w-full"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={() => setOpenImg(null)}
                            className="absolute top-3 right-3 z-[999999] rounded-lg bg-black/50 px-3 py-1.5 text-white hover:bg-black/70"
                        >
                            ✕
                        </button>

                        <img
                            src={openImg}
                            alt="preview"
                            className="w-full max-h-[80vh] object-contain rounded-2xl border border-white/10 bg-black"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

function Card({ title, children }) {
    return (
        <div className="rounded-2xl border bg-white shadow-sm p-5">
            <h3 className="font-semibold text-slate-900">{title}</h3>
            <div className="mt-3">{children}</div>
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

    return (
        <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs ${cls}`}>
            {children}
        </span>
    );
}