import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    doc,
    getDoc,
    updateDoc,
    collection,
    getDocs,
    query,
    where,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import CityMap from "../Components/CityMap";
import toast from "react-hot-toast";
import { deleteDoc } from "firebase/firestore";
export default function ReportDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [report, setReport] = useState(null);
    const [workers, setWorkers] = useState([]);
    const [loading, setLoading] = useState(true);

    const [selectedWorker, setSelectedWorker] = useState("");
    const [status, setStatus] = useState("");
    const [selectedImage, setSelectedImage] = useState(null);
    useEffect(() => {
        async function fetchReport() {
            const docRef = doc(db, "reports", id);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = { id: docSnap.id, ...docSnap.data() };
                setReport(data);
                setStatus(data.status);
                setSelectedWorker(data.assignedTo || "");
            }

            setLoading(false);
        }

        fetchReport();
    }, [id]);

    useEffect(() => {
        async function fetchWorkers() {
            const q = query(collection(db, "users"), where("role", "==", "technical"));
            const snapshot = await getDocs(q);

            const techs = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));

            setWorkers(techs);
        }

        fetchWorkers();
    }, []);

    async function assignWorker() {
        if (!selectedWorker) {
            toast.error("Please select worker");
            return;
        }

        try {
            await updateDoc(doc(db, "reports", id), {
                assignedTo: selectedWorker,
                status: "in_progress",
            });

            toast.success("Worker assigned successfully");

            setReport({
                ...report,
                assignedTo: selectedWorker,
                status: "in_progress",
            });

            setStatus("in_progress");
        } catch (error) {
            console.error(error);
            toast.error("Failed to assign worker");
        }
    }
    async function finishReport() {
        try {
            await deleteDoc(doc(db, "reports", id));

            toast.success("Report finished and deleted");

            navigate("/reports");
        } catch (error) {
            console.error(error);
            toast.error("Failed to finish report");
        }
    }
    async function updateStatus() {
        try {
            await updateDoc(doc(db, "reports", id), {
                status: status,
            });

            toast.success("Status updated successfully");
            setReport({ ...report, status });
        } catch (error) {
            console.error(error);
            toast.error("Failed to update status");
        }
    }

    if (loading) return <div className="p-6">Loading...</div>;
    if (!report) return <div className="p-6">Report not found</div>;

    return (
        <div className="space-y-6">
            <div>
                <button
                    onClick={() => navigate("/reports")}
                    className="text-sm text-indigo-600 hover:underline"
                >
                    ← Back to Reports
                </button>

                <h1 className="mt-2 text-2xl font-bold">{report.type}</h1>
                <p className="text-sm text-slate-500">
                    {report.city} • {report.address}
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="space-y-6">
                    <div className="rounded-2xl border bg-white shadow-sm p-5">
                        <h3 className="font-semibold">Description</h3>
                        <p className="text-sm mt-2">{report.notes}</p>
                    </div>

                    <div className="rounded-2xl border bg-white shadow-sm p-5">
                        <h3 className="font-semibold">Assign to Worker</h3>

                        <label className="text-xs text-slate-500">Select Worker</label>

                        <select
                            value={selectedWorker}
                            onChange={(e) => setSelectedWorker(e.target.value)}
                            className="mt-2 w-full rounded-xl border px-3 py-2 text-sm"
                        >
                            <option value="">Unassigned</option>

                            {workers.map((w) => (
                                <option key={w.id} value={w.id}>
                                    {w.name || w.email}
                                </option>
                            ))}
                        </select>

                        <button
                            onClick={assignWorker}
                            className="mt-3 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-xl"
                        >
                            Assign
                        </button>
                    </div>

                    {/* <div className="rounded-2xl border bg-white shadow-sm p-5">
                        <h3 className="font-semibold">Update Status</h3>

                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="mt-2 w-full rounded-xl border px-3 py-2 text-sm"
                        >
                            <option value="pending">pending</option>
                            <option value="in_progress">in_progress</option>
                            <option value="resolved">resolved</option>
                        </select>

                        <button
                            onClick={updateStatus}
                            className="mt-3 w-full bg-black text-white py-2 rounded-xl"
                        >
                            Save Status
                        </button>
                    </div> */}
                </div>

                <div className="lg:col-span-2 space-y-4">
                    {/* 🗺️ MAP */}
                    <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
                        <div className="h-96">
                            <CityMap reports={[report]} />
                        </div>
                    </div>

                    {/* 🖼️ IMAGE تحت الماب */}
                    {report.images && report.images.length > 0 && (
                        <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">

                            {/* Title */}
                            <div className="p-4 border-b">
                                <h3 className="font-semibold">Report Image</h3>
                            </div>

                            {/* Image */}
                            <div className="p-4 flex justify-center">
                                <img
                                    src={report.images[0]}
                                    alt="report"
                                    onClick={() => setSelectedImage(report.images[0])}
                                    className="w-full max-h-[350px] object-cover rounded-xl cursor-pointer hover:scale-[1.02] transition"
                                />
                            </div>
                        </div>
                    )}
                    {/* 🔥 AFTER IMAGE */}
                    {report.afterImage && (
                        <div className="rounded-2xl border bg-white shadow-sm overflow-hidden mt-4">

                            <div className="p-4 border-b">
                                <h3 className="font-semibold">After Image</h3>
                            </div>

                            <div className="p-4 flex justify-center">
                                <img
                                    src={report.afterImage}
                                    alt="after"
                                    onClick={() => setSelectedImage(report.afterImage)}
                                    className="w-full max-h-[350px] object-cover rounded-xl cursor-pointer hover:scale-[1.02] transition"
                                />
                            </div>
                        </div>
                    )}
                    <button
                        onClick={finishReport}
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl mt-4"
                    >
                        Finish Report
                    </button>
                    {selectedImage && (
                        <div
                            className="fixed inset-0 bg-black/80 flex items-center justify-center z-9999"
                            onClick={() => setSelectedImage(null)}
                        >
                            <img
                                src={selectedImage}
                                alt="preview"
                                className="max-w-[90%] max-h-[90%] rounded-xl shadow-lg"
                            />

                            {/* زرار قفل */}
                            <button
                                onClick={() => setSelectedImage(null)}
                                className="absolute top-5 right-5 text-white text-2xl font-bold"
                            >
                                ✕
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}