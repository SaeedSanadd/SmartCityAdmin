import { useEffect, useState, useMemo } from "react";
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
import { useTranslation } from "react-i18next";
import Badge, { statusTone } from "../Components/Badge";
import {
  FaArrowLeft,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaClock,
  FaExclamationCircle,
  FaTimes,
  FaChevronRight,
  FaUserCog,
  FaUserShield,
  FaIdBadge,
  FaCalendarAlt,
  FaPhoneAlt,
  FaExclamationTriangle,
} from "react-icons/fa";

const statusSteps = ["pending", "in_progress", "resolved"];

function StatusTimeline({ currentStatus }) {
  const currentIdx = statusSteps.indexOf(currentStatus);
  return (
    <div className="flex items-center gap-1 w-full">
      {statusSteps.map((step, idx) => {
        const isCompleted = idx <= currentIdx;
        const isCurrent = idx === currentIdx;
        return (
          <div key={step} className="flex items-center gap-1 flex-1">
            <div
              className={`
                            h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all duration-300
                            ${
                              isCompleted
                                ? "bg-primary text-white shadow-sm"
                                : "bg-slate-100 text-slate-400"
                            }
                            ${isCurrent ? "ring-2 ring-primary/20 scale-110" : ""}
                        `}
            >
              {isCompleted ? (
                idx < currentIdx ? (
                  <FaCheckCircle className="text-[10px]" />
                ) : (
                  idx + 1
                )
              ) : (
                idx + 1
              )}
            </div>
            {idx < statusSteps.length - 1 && (
              <div
                className={`flex-1 h-0.5 rounded-full transition-all duration-300 ${idx < currentIdx ? "bg-primary" : "bg-slate-200"}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function ReportDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const [report, setReport] = useState(null);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedWorker, setSelectedWorker] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [assignedWorkerInfo, setAssignedWorkerInfo] = useState(null);

  const isRtl = i18n.language === "ar";

  // Calculate workload and area recommendations
  const sortedWorkers = useMemo(() => {
    if (!report || workers.length === 0) return [];
    return [...workers].map((w) => {
      const matchesArea =
        (report.city && w.area && report.city.toLowerCase().trim() === w.area.toLowerCase().trim()) ||
        (report.address && w.area && report.address.toLowerCase().includes(w.area.toLowerCase().trim()));
      
      const score = (matchesArea ? 100 : 0) - (w.tasks || 0) * 10;
      return { ...w, matchesArea, score };
    }).sort((a, b) => b.score - a.score);
  }, [workers, report]);

  // Dynamic Audit Timeline Events
  const timelineEvents = useMemo(() => {
    if (!report) return [];
    if (report.history && report.history.length > 0) {
      return report.history;
    }
    
    const createdTime = report.createdAt?.seconds 
      ? report.createdAt.seconds * 1000 
      : report.createdAt ? new Date(report.createdAt).getTime() : 0;

    const events = [];
    if (report.createdAt) {
      events.push({
        action: "created",
        timestamp: report.createdAt.seconds
          ? new Date(report.createdAt.seconds * 1000).toISOString()
          : new Date(report.createdAt).toISOString(),
        actor: "Citizen"
      });
    }
    if (report.assignedTo) {
      events.push({
        action: "assigned",
        timestamp: new Date(createdTime + 60000).toISOString(),
        actor: "Admin",
        userName: assignedWorkerInfo?.name || "Technical"
      });
    }
    if (report.status === "resolved") {
      events.push({
        action: "resolved",
        timestamp: report.resolvedAt || (createdTime ? new Date(createdTime + 120000).toISOString() : new Date("2026-06-04").toISOString()),
        actor: "Admin"
      });
    }
    return events;
  }, [report, assignedWorkerInfo]);

  useEffect(() => {
    async function fetchReport() {
      const docRef = doc(db, "reports", id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = { id: docSnap.id, ...docSnap.data() };
        setReport(data);
        setSelectedWorker(data.assignedTo || "");
      }
      setLoading(false);
    }
    fetchReport();
  }, [id]);

  useEffect(() => {
    async function fetchWorkers() {
      const q = query(
        collection(db, "users"),
        where("role", "==", "technical"),
      );
      const snapshot = await getDocs(q);
      const techs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setWorkers(techs);
    }
    fetchWorkers();
  }, []);

  // Fetch assigned worker details
  useEffect(() => {
    async function fetchAssignedWorker() {
      if (!report?.assignedTo) {
        setAssignedWorkerInfo(null);
        return;
      }
      try {
        const workerDoc = await getDoc(doc(db, "users", report.assignedTo));
        if (workerDoc.exists()) {
          setAssignedWorkerInfo({ id: workerDoc.id, ...workerDoc.data() });
        }
      } catch (err) {
        console.error("Failed to fetch assigned worker:", err);
      }
    }
    fetchAssignedWorker();
  }, [report?.assignedTo]);

  async function assignWorker() {
    if (report?.status === "resolved") {
      toast.error(t("cannot_assign_resolved"));
      return;
    }
    if (!selectedWorker) {
      toast.error(t("select_worker_error"));
      return;
    }
    try {
      const prevWorkerId = report.assignedTo;
      const reportRef = doc(db, "reports", id);

      const logEntry = {
        action: "assigned",
        timestamp: new Date().toISOString(),
        actor: "Admin",
        userId: selectedWorker,
        userName: workers.find(w => w.id === selectedWorker)?.name || "Technical"
      };

      const updatedHistory = report.history ? [...report.history, logEntry] : [
        { 
          action: "created", 
          timestamp: report.createdAt?.seconds 
            ? new Date(report.createdAt.seconds * 1000).toISOString()
            : new Date(report.createdAt || Date.now()).toISOString(), 
          actor: "Citizen" 
        },
        logEntry
      ];

      await updateDoc(reportRef, {
        assignedTo: selectedWorker,
        status: "in_progress",
        history: updatedHistory
      });

      // Update task counts for workers
      if (prevWorkerId && prevWorkerId !== selectedWorker) {
        const prevRef = doc(db, "users", prevWorkerId);
        const prevSnap = await getDoc(prevRef);
        if (prevSnap.exists()) {
          const currentTasks = prevSnap.data().tasks || 0;
          await updateDoc(prevRef, { tasks: Math.max(0, currentTasks - 1) });
        }
      }

      if (!prevWorkerId || prevWorkerId !== selectedWorker) {
        const nextRef = doc(db, "users", selectedWorker);
        const nextSnap = await getDoc(nextRef);
        if (nextSnap.exists()) {
          const currentTasks = nextSnap.data().tasks || 0;
          await updateDoc(nextRef, { tasks: currentTasks + 1 });
        }
      }

      toast.success(t("assign_success"));
      setReport({
        ...report,
        assignedTo: selectedWorker,
        status: "in_progress",
        history: updatedHistory
      });
    } catch (error) {
      console.error(error);
      toast.error(t("assign_fail"));
    }
  }

  async function finishReport() {
    try {
      const reportRef = doc(db, "reports", id);
      const resolvedAt = new Date().toISOString();
      const logEntry = {
        action: "resolved",
        timestamp: resolvedAt,
        actor: "Admin"
      };

      const updatedHistory = report.history ? [...report.history, logEntry] : [
        { 
          action: "created", 
          timestamp: report.createdAt?.seconds 
            ? new Date(report.createdAt.seconds * 1000).toISOString()
            : new Date(report.createdAt || Date.now()).toISOString(), 
          actor: "Citizen" 
        },
        logEntry
      ];

      await updateDoc(reportRef, {
        status: "resolved",
        resolvedAt,
        history: updatedHistory
      });

      if (report.assignedTo) {
        const workerRef = doc(db, "users", report.assignedTo);
        const workerSnap = await getDoc(workerRef);
        if (workerSnap.exists()) {
          const currentTasks = workerSnap.data().tasks || 0;
          await updateDoc(workerRef, { tasks: Math.max(0, currentTasks - 1) });
        }
      }

      toast.success(t("finish_success"), {
        duration: 4000,
        style: {
          background: "#10b981",
          color: "#fff",
          fontWeight: "600",
          borderRadius: "12px",
        },
        iconTheme: { primary: "#fff", secondary: "#10b981" },
      });
      setReport({ ...report, status: "resolved", resolvedAt, history: updatedHistory });
    } catch (error) {
      console.error(error);
      toast.error(t("finish_fail"));
    }
  }



  if (loading)
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="spinner border-primary/30! border-t-primary! w-8! h-8!" />
          <p className="text-sm text-slate-400">{t("loading")}</p>
        </div>
      </div>
    );

  if (!report)
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <FaExclamationCircle className="text-4xl text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-500 font-medium">
            {t("report_not_found")}
          </p>
        </div>
      </div>
    );

  return (
    <div className="space-y-6 animate-fadeInUp">
      {/* Header Card */}
      <div className="rounded-2xl glass-card-strong overflow-hidden">
        <div className="h-1.5 w-full bg-linear-to-r from-emerald-500 via-primary to-emerald-600" />

        <div className="p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex items-start gap-4">
              <button
                onClick={() => navigate("/reports")}
                className="h-10 w-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700 transition-all shrink-0"
              >
                <FaArrowLeft className="text-sm" />
              </button>

              <div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  {report.type}
                </h1>
                <div className="flex items-center gap-2 mt-1 text-sm text-slate-500">
                  <FaMapMarkerAlt className="text-primary/60 text-xs" />
                  <span>
                    {report.city} • {report.address}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Badge tone={statusTone(report.status)}>{report.status}</Badge>
            </div>
          </div>

          {/* Status Timeline */}
          <div className="mt-5 pt-4 border-t border-slate-100">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Report Progress
            </p>
            <StatusTimeline currentStatus={report.status} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="space-y-5">
          {/* Description */}
          <div className="rounded-2xl glass-card-strong p-5 hover-lift">
            <h3 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
              {t("description")}
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {report.notes}
            </p>
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

            <select
              value={selectedWorker}
              onChange={(e) => setSelectedWorker(e.target.value)}
              disabled={report?.status === "resolved"}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm bg-white outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">{t("unassigned")}</option>
              {sortedWorkers.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name || w.email}
                </option>
              ))}
            </select>

            <button
              onClick={assignWorker}
              disabled={report?.status === "resolved"}
              className="mt-3.5 w-full bg-primary hover:bg-primary-hover text-white py-3 rounded-2xl font-bold shadow-sm hover:shadow-md transition-all text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t("assign")}
            </button>
            {report?.status === "resolved" && (
              <div className="flex items-center gap-2 mt-3.5 text-xs text-amber-700 font-semibold leading-snug animate-fadeIn">
                <FaExclamationTriangle className="text-amber-500 text-xs shrink-0" />
                <span>{t("cannot_assign_resolved")}</span>
              </div>
            )}
          </div>
          {/* Assigned Technical Info */}
          {assignedWorkerInfo && (
            <div className="rounded-2xl glass-card-strong p-5 hover-lift">
              <h3 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                {t("technical_info")}
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
                      <span className="truncate">
                        {assignedWorkerInfo.email}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Report Meta Info */}
          <div className="rounded-2xl glass-card-strong p-5 hover-lift">
            <h3 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-violet-500" />
              {t("report_info")}
            </h3>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">
                  {t("report")} ID
                </span>
                <span className="text-slate-700 font-mono text-xs">
                  {report.id.slice(0, 12)}…
                </span>
              </div>
              {report.createdAt && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">
                    {t("submitted")}
                  </span>
                  <span className="text-slate-700 text-xs flex items-center gap-1.5">
                    <FaCalendarAlt className="text-[10px] text-slate-400" />
                    {new Date(
                      report.createdAt.seconds
                        ? report.createdAt.seconds * 1000
                        : report.createdAt,
                    ).toLocaleDateString()}
                  </span>
                </div>
              )}
              {report.type && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">
                    {t("report_type")}
                  </span>
                  <span className="text-slate-700 text-xs">{report.type}</span>
                </div>
              )}
            </div>
          </div>

          {/* Audit Timeline */}
          <div className="rounded-2xl glass-card-strong p-5 hover-lift">
            <h3 className="font-bold text-slate-800 text-sm mb-5 flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
              {t("history_timeline")}
            </h3>
            
            <div className={`relative ${isRtl ? 'pr-5 border-r' : 'pl-5 border-l'} border-slate-100 space-y-6`}>
              {timelineEvents.map((evt, idx) => {
                let title = "";
                let bgCircle = "";
                
                if (evt.action === "created") {
                  title = t("action_created");
                  bgCircle = "bg-blue-500";
                } else if (evt.action === "assigned") {
                  title = `${t("action_assigned")} ${evt.userName || "Technical"}`;
                  bgCircle = "bg-amber-500";
                } else if (evt.action === "in_progress") {
                  title = t("action_in_progress");
                  bgCircle = "bg-indigo-500";
                } else if (evt.action === "resolved") {
                  title = t("action_resolved");
                  bgCircle = "bg-emerald-500";
                }
                
                return (
                  <div key={idx} className="relative">
                    <div className={`absolute ${isRtl ? '-right-[26px]' : '-left-[26px]'} top-1 h-3.5 w-3.5 rounded-full ${bgCircle} border-[3px] border-white shadow-sm`} />
                    <div>
                      <p className="text-xs font-semibold text-slate-800 leading-snug">
                        {title}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                        <span>{new Date(evt.timestamp).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-5">
          {/* Map */}
          <div className="rounded-2xl glass-card-strong overflow-hidden hover-lift">
            <div className="h-80 sm:h-96">
              <CityMap reports={[report]} />
            </div>
          </div>

          {/* Report Image */}
          {report.images && report.images.length > 0 && (
            <div className="rounded-2xl glass-card-strong overflow-hidden hover-lift">
              <div className="px-5 py-3.5 border-b border-slate-100/80 flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                <h3 className="font-bold text-slate-800 text-sm">
                  {t("report_image")}
                </h3>
              </div>
              <div className="p-4 bg-slate-50/30">
                <img
                  src={report.images[0]}
                  alt="report"
                  onClick={() => setSelectedImage(report.images[0])}
                  className="w-full max-h-[300px] object-cover rounded-xl cursor-pointer hover:scale-[1.01] transition-all duration-300 shadow-sm"
                />
              </div>
            </div>
          )}

          {/* After Image */}
          {report.afterImage && (
            <div className="rounded-2xl glass-card-strong overflow-hidden hover-lift">
              <div className="px-5 py-3.5 border-b border-slate-100/80 flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <h3 className="font-bold text-slate-800 text-sm">
                  {t("after_image")}
                </h3>
              </div>
              <div className="p-4 bg-slate-50/30">
                <img
                  src={report.afterImage}
                  alt="after"
                  onClick={() => setSelectedImage(report.afterImage)}
                  className="w-full max-h-[300px] object-cover rounded-xl cursor-pointer hover:scale-[1.01] transition-all duration-300 shadow-sm"
                />
              </div>
            </div>
          )}

          {/* Finish / Waiting */}
          {report.status === "resolved" ? (
            <div className="p-4 rounded-xl border border-emerald-200/70 bg-emerald-50/60 text-emerald-800 text-sm flex items-center gap-3 shadow-sm">
              <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                <FaCheckCircle className="text-emerald-600 text-lg" />
              </div>
              <div>
                <p className="font-semibold text-emerald-900 text-sm">
                  {t("action_resolved")}
                </p>
                {report.resolvedAt && (
                  <p className="text-xs text-emerald-600 mt-0.5">
                    {new Date(report.resolvedAt).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          ) : report.afterImage ? (
            <button
              onClick={finishReport}
              className="w-full bg-linear-to-r from-primary to-emerald-600 hover:from-primary-hover hover:to-emerald-700 text-white py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group"
            >
              <FaCheckCircle className="group-hover:scale-110 transition-transform" />
              {t("finish_report")}
            </button>
          ) : (
            <div className="p-4 rounded-xl border border-amber-200/70 bg-amber-50/60 text-amber-800 text-sm flex items-center gap-3 shadow-sm">
              <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                <FaClock className="text-amber-600" />
              </div>
              <div>
                <p className="font-semibold text-amber-900 text-sm">
                  {t("waiting_for_technical")}
                </p>
                <p className="text-xs text-amber-600 mt-0.5 leading-relaxed">
                  {t("cannot_finish_no_report")}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Image Lightbox */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-9999 animate-overlayIn" onClick={() => setSelectedImage(null)}>
          <img src={selectedImage} alt="preview"
          className="max-w-[90%] max-h-[85vh] rounded-2xl shadow-2xl animate-scaleIn" onClick={(e) => e.stopPropagation()}/>
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-5 right-5 h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 flex 
            items-center justify-center text-white transition-all backdrop-blur-sm">
            <FaTimes />
          </button>
        </div>
      )}
    </div>
  );
}
