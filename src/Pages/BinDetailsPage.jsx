import { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {doc,getDoc,updateDoc,collection,getDocs,query,where,} from "firebase/firestore";
import { db } from "../firebase/firebase";
import BinsMap from "../Components/BinsMap";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import Badge from "../Components/Badge";
import {FaArrowLeft,FaMapMarkerAlt,FaCheckCircle,FaExclamationCircle,FaIdBadge,FaCalendarAlt,FaPhoneAlt,FaExclamationTriangle,} from "react-icons/fa";
export default function BinDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [bin, setBin] = useState(null);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorker, setSelectedWorker] = useState("");
  const [assignedWorkerInfo, setAssignedWorkerInfo] = useState(null);
  // Calculate workload and area recommendations for workers
  const sortedWorkers = useMemo(() => {
    if (!bin || workers.length === 0) return [];
    return [...workers]
      .map((w) => {
        const matchesArea =
          w.area &&
          bin.locationName &&
          bin.locationName.toLowerCase().includes(w.area.toLowerCase().trim());
        const score = (matchesArea ? 100 : 0) - (w.tasks || 0) * 10;
        return { ...w, matchesArea, score };
      })
      .sort((a, b) => b.score - a.score);
  }, [workers, bin]);
  // Fetch the specific bin details
  useEffect(() => {
    async function fetchBin() {
      try {
        const docRef = doc(db, "Bins", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = { id: docSnap.id, ...docSnap.data() };
          setBin(data);
          setSelectedWorker(data.assignedTo || "");
        }
      } catch (err) {
        console.error("Failed to fetch bin details:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchBin();
  }, [id]);
  // Fetch all technicians
  useEffect(() => {
    async function fetchWorkers() {
      try {
        const q = query(
          collection(db, "users"),
          where("role", "==", "technical")
        );
        const snapshot = await getDocs(q);
        const techs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setWorkers(techs);
      } catch (err) {
        console.error("Failed to fetch technicals:", err);
      }
    }
    fetchWorkers();
  }, []);
  // Fetch assigned worker details when bin.assignedTo changes
  useEffect(() => {
    async function fetchAssignedWorker() {
      if (!bin?.assignedTo) {
        setAssignedWorkerInfo(null);
        return;
      }
      try {
        const workerDoc = await getDoc(doc(db, "users", bin.assignedTo));
        if (workerDoc.exists()) {
          setAssignedWorkerInfo({ id: workerDoc.id, ...workerDoc.data() });
        } else {
          setAssignedWorkerInfo(null);
        }
      } catch (err) {
        console.error("Failed to fetch assigned worker info:", err);
      }
    }
    fetchAssignedWorker();
  }, [bin?.assignedTo]);

  // Assign worker workflow
  async function assignWorker() {
    if (bin.status !== "FULL") {
      toast.error(t("assign_only_full"));
      return;
    }
    if (!selectedWorker) {
      toast.error(t("select_worker_error"));
      return;
    }
    try {
      const prevWorkerId = bin.assignedTo;
      const binRef = doc(db, "Bins", id);
      await updateDoc(binRef, {
        assignedTo: selectedWorker,
      });
      // Decrement tasks count for previous worker if reassigned
      if (prevWorkerId && prevWorkerId !== selectedWorker) {
        const prevRef = doc(db, "users", prevWorkerId);
        const prevSnap = await getDoc(prevRef);
        if (prevSnap.exists()) {
          const currentTasks = prevSnap.data().tasks || 0;
          await updateDoc(prevRef, { tasks: Math.max(0, currentTasks - 1) });
        }
      }
      // Increment tasks count for new worker
      if (!prevWorkerId || prevWorkerId !== selectedWorker) {
        const nextRef = doc(db, "users", selectedWorker);
        const nextSnap = await getDoc(nextRef);
        if (nextSnap.exists()) {
          const currentTasks = nextSnap.data().tasks || 0;
          await updateDoc(nextRef, { tasks: currentTasks + 1 });
        }
      }
      toast.success(t("assign_success"));
      setBin((prev) => ({
        ...prev,
        assignedTo: selectedWorker,
      }));
    } catch (error) {
      console.error(error);
      toast.error(t("assign_fail"));
    }
  }
  // Clear technician assignment and mark bin as NORMAL (Emptied)
  async function markAsEmpty() {
    try {
      const binRef = doc(db, "Bins", id);
      await updateDoc(binRef, {
        status: "NORMAL",
        assignedTo: "",
      });
      // Decrement technician tasks workload count
      if (bin.assignedTo) {
        const workerRef = doc(db, "users", bin.assignedTo);
        const workerSnap = await getDoc(workerRef);
        if (workerSnap.exists()) {
          const currentTasks = workerSnap.data().tasks || 0;
          await updateDoc(workerRef, { tasks: Math.max(0, currentTasks - 1) });
        }
      }
      toast.success(t("finish_success"));
      setBin((prev) => ({
        ...prev,
        status: "NORMAL",
        assignedTo: "",
      }));
      setSelectedWorker("");
    } catch (error) {
      console.error(error);
      toast.error(t("status_fail"));
    }
  }
  const getStatusBadgeTone = (status) => {
    return status === "FULL" ? "danger" : "success";
  };
  const getStatusLabel = (status) => {
    if (status === "FULL") return t("full");
    return t("normal");
  };
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="spinner border-primary/30! border-t-primary! w-8! h-8!" />
          <p className="text-sm text-slate-400">{t("loading")}</p>
        </div>
      </div>
    );
  }
  if (!bin) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <FaExclamationCircle className="text-4xl text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-500 font-medium">
            {t("bin_not_found")}
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-6 animate-fadeInUp">
      {/* Header Card */}
      <div className="rounded-2xl glass-card-strong overflow-hidden">
        <div className="h-1.5 w-full bg-linear-to-r from-emerald-500 via-primary to-emerald-600" />
        <div className="p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex items-start gap-4">
              <button onClick={() => navigate("/reports")}
              className="h-10 w-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700 transition-all shrink-0 cursor-pointer">
                <FaArrowLeft className="text-sm" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  {bin.binId}
                </h1>
                <div className="flex items-center gap-2 mt-1 text-sm text-slate-500">
                  <FaMapMarkerAlt className="text-primary/60 text-xs" />
                  <span>{bin.locationName}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Badge tone={getStatusBadgeTone(bin.status)}>
                {getStatusLabel(bin.status)}
              </Badge>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="space-y-5">
          {/* Bin Info Details */}
          <div className="rounded-2xl glass-card-strong p-5 hover-lift">
            <h3 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
              {t("bin_info")}
            </h3>
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400 font-medium">
                  {t("location_name")}
                </span>
                <span className="text-slate-700 font-medium text-xs">
                  {bin.locationName}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400 font-medium">
                  {t("report_date_time")}
                </span>
                <span className="text-slate-700 text-xs flex items-center gap-1.5">
                  <FaCalendarAlt className="text-[10px] text-slate-400" />
                  {bin.reportDate} {bin.reportTime}
                </span>
              </div>
            </div>
          </div>
          {/* Assign Worker */}
          <div className="rounded-2xl glass-card-strong p-5 hover-lift">
            <h3 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
              <span className="text-blue-500 text-lg leading-none">•</span>
              <span>{t("assign_worker")}</span>
            </h3>
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              {t("select_worker")}
            </label>

            <select disabled={bin.status !== "FULL"} value={selectedWorker} onChange={(e) => setSelectedWorker(e.target.value)}
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm bg-white outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
              <option value="">{t("unassigned")}</option>
              {sortedWorkers.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name || w.email}
                </option>
              ))}
            </select>
            <button
              disabled={bin.status !== "FULL"}
              onClick={assignWorker}
              className="mt-3.5 w-full bg-primary hover:bg-primary-hover text-white py-3 rounded-2xl font-bold shadow-sm hover:shadow-md transition-all text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
              {t("assign")}
            </button>
            {bin.status !== "FULL" && (
              <div className="flex items-center gap-2 mt-3.5 text-xs text-amber-700 font-semibold leading-snug">
                <FaExclamationTriangle className="text-amber-500 text-xs shrink-0" />
                <span>{t("assign_only_full")}</span>
              </div>
            )}
          </div>
          {/* Assigned Technician Info */}
          {assignedWorkerInfo && (
            <div className="rounded-2xl glass-card-strong p-5 hover-lift">
              <h3 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                {t("assigned_technical")}
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-linear-to-br from-emerald-500 to-emerald-600 text-white text-sm font-bold flex items-center justify-center shrink-0 shadow-sm">
                    {(assignedWorkerInfo.name || "?").charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 text-sm truncate">
                      {assignedWorkerInfo.name}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate font-mono">
                      ID: {assignedWorkerInfo.id.slice(0, 8)}…
                    </p>
                  </div>
                </div>
                <div className="space-y-2 pt-1">
                  {assignedWorkerInfo.phone && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <FaPhoneAlt className="text-[10px] text-slate-400" />
                      <span>{assignedWorkerInfo.phone}</span>
                    </div>
                  )}
                  {assignedWorkerInfo.area && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <FaMapMarkerAlt className="text-[10px] text-slate-400" />
                      <span>{assignedWorkerInfo.area}</span>
                    </div>
                  )}
                  {assignedWorkerInfo.email && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <FaIdBadge className="text-[10px] text-slate-400" />
                      <span className="truncate">{assignedWorkerInfo.email}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        {/* Right Column */}
        <div className="lg:col-span-2 space-y-5">
          {/* Leaflet Map with Single Bin Pin */}
          <div className="rounded-2xl glass-card-strong overflow-hidden hover-lift h-80 sm:h-96">
            <BinsMap bins={[bin]} />
          </div>
          {/* Action Resolution / Alert Display */}
          {bin.status === "FULL" ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-red-200/70 bg-red-50/60 text-red-800 text-sm flex items-center gap-3 shadow-sm">
                <div className="h-10 w-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                  <FaExclamationCircle className="text-red-600 text-lg animate-pulse" />
                </div>
                <div>
                  <p className="font-bold text-red-900 text-sm">
                    {t("full")}
                  </p>
                  <p className="text-xs text-red-600 mt-0.5 leading-relaxed">
                    Bin is reported full and requires technical emptying.
                  </p>
                </div>
              </div>
              {/* Action Button: Manually Emptied */}
              <button
                onClick={markAsEmpty}
                className="w-full bg-linear-to-r from-primary to-emerald-600 hover:from-primary-hover hover:to-emerald-700 text-white py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group cursor-pointer">
                <FaCheckCircle className="group-hover:scale-110 transition-transform" />
                Mark as Emptied
              </button>
            </div>
          ) : (
            <div className="p-4 rounded-xl border border-emerald-200/70 bg-emerald-50/60 text-emerald-800 text-sm flex items-center gap-3 shadow-sm">
              <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                <FaCheckCircle className="text-emerald-600 text-lg" />
              </div>
              <div>
                <p className="font-semibold text-emerald-900 text-sm">
                  {t("normal")}
                </p>
                <p className="text-xs text-emerald-600 mt-0.5">
                  Bin is currently operating below thresholds. No immediate action required.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
