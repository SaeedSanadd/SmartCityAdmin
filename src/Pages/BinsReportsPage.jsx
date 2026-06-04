import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useTranslation } from "react-i18next";
import {FaSearch,FaInbox,FaDownload,FaMapMarkedAlt,FaList,FaTrash,FaExclamationTriangle,FaCheckCircle} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Badge from "../Components/Badge";
import StatCard from "../Components/StatCard";
import BinsMap from "../Components/BinsMap";
export default function BinsReportsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [bins, setBins] = useState([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("All");
  const [viewMode, setViewMode] = useState("table"); // 'table' or 'map'
  const [sortOrder, setSortOrder] = useState("newest"); // 'newest' or 'oldest'
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "Bins"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setBins(data);
    });
    return () => unsubscribe();
  }, []);
  const kpis = useMemo(() => {
    const total = bins.length;
    const full = bins.filter((b) => b.status === "FULL").length;
    const normal = bins.filter((b) => b.status !== "FULL").length;
    return [
      {
        title: t("total_bins"),
        value: total,
        icon: <FaTrash />,
        bgClass: "bg-primary/10 text-primary border-primary/20",
      },
      {
        title: t("full_bins"),
        value: full,
        icon: <FaExclamationTriangle />,
        bgClass: "bg-red-50 text-red-600 border-red-200/60",
      },
      {
        title: t("normal_bins"),
        value: normal,
        icon: <FaCheckCircle />,
        bgClass: "bg-green-50 text-green-600 border-green-200/60",
      },
    ];
  }, [bins, t]);

  const filtered = useMemo(() => {
    const result = bins.filter((b) => {
      const matchQ =
        q.trim() === "" ||
        `${b.binId ?? ""} ${b.locationName ?? ""}`
          .toLowerCase()
          .includes(q.toLowerCase());
      const matchStatus =
        status === "All"
          ? true
          : status === "FULL"
          ? b.status === "FULL"
          : b.status !== "FULL";
      return matchQ && matchStatus;
    });
    return result.sort((a, b) => {
      const getMs = (item) => {
        if (!item.reportDate) return 0;
        const timeStr = item.reportTime || "12:00 AM";
        const d = new Date(`${item.reportDate} ${timeStr}`);
        return isNaN(d.getTime()) ? 0 : d.getTime();
      };
      const msA = getMs(a);
      const msB = getMs(b);
      return sortOrder === "newest" ? msB - msA : msA - msB;
    });
  }, [bins, q, status, sortOrder]);
  const getStatusBadgeTone = (status) => {
    return status === "FULL" ? "danger" : "success";
  };
  const getStatusLabel = (status) => {
    if (status === "FULL") return t("full");
    return t("normal");
  };
  const exportToCSV = () => {
    if (filtered.length === 0) return;
    const headers = [
      "Bin ID",
      "Location Name",
      "Status",
      "Latitude",
      "Longitude",
      "Report Date",
      "Report Time",
    ];
    const csvRows = [
      headers.join(","),
      ...filtered.map((b) => {
        const row = [
          `"${(b.binId || "").replace(/"/g, '""')}"`,
          `"${(b.locationName || "").replace(/"/g, '""')}"`,
          `"${(b.status || "").replace(/"/g, '""')}"`,
          Number(b.latitude || 0).toFixed(6),
          Number(b.longitude || 0).toFixed(6),
          `"${(b.reportDate || "").replace(/"/g, '""')}"`,
          `"${(b.reportTime || "").replace(/"/g, '""')}"`,
        ];
        return row.join(",");
      }),
    ];
    const csvContent = "\uFEFF" + csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `SCMS_Bins_Export_${new Date().toISOString().slice(0, 10)}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const statusFilters = [
    { key: "All", label: t("all_status") },
    { key: "FULL", label: t("full") },
    { key: "NORMAL", label: t("normal") },
  ];
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-fadeInUp">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {t("bins_reports")}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {t("bins_reports_desc")}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          {/* Export button */}
          <button
            onClick={exportToCSV}
            disabled={filtered.length === 0}
            className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 text-slate-600 disabled:cursor-not-allowed px-4 py-2 text-sm font-semibold transition-all shadow-sm hover:shadow-md flex items-center gap-2 cursor-pointer">
            <FaDownload className="text-xs" />
            {t("export_csv")}
          </button>
          {/* Search */}
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 text-xs" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("search_placeholder")}
              className="w-full md:w-64 rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"/>
          </div>
          {/* Status pills */}
          <div className="flex rounded-xl border border-slate-200/80 overflow-hidden bg-slate-50/50">
            {statusFilters.map((f) => (
              <button
                key={f.key}
                onClick={() => setStatus(f.key)}
                className={`px-3 py-2 text-xs font-medium transition-all duration-200 cursor-pointer
                  ${status === f.key ? "bg-primary text-white shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"}`}>
                {f.label}
              </button>
            ))}
          </div>
          {/* Sort select */}
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all text-slate-600 font-medium cursor-pointer">
            <option value="newest">{t("newest_first")}</option>
            <option value="oldest">{t("oldest_first")}</option>
          </select>
          {/* View Mode Toggle */}
          <div className="flex rounded-xl border border-slate-200/80 overflow-hidden bg-slate-50/50 p-0.5">
            <button
              onClick={() => setViewMode("table")}
              title={t("table_view")}
              className={`p-2 rounded-lg transition-all duration-200 cursor-pointer
                ${viewMode === "table" ? "bg-primary text-white shadow-sm"
                 : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"}`} >
              <FaList className="text-sm" />
            </button>
            <button onClick={() => setViewMode("map")} title={t("map_view")}
            className={`p-2 rounded-lg transition-all duration-200 cursor-pointer ${ viewMode === "map"
              ? "bg-primary text-white shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"}`}>
              <FaMapMarkedAlt className="text-sm" />
            </button>
          </div>
        </div>
      </div>
      {/* KPI Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map((stat, idx) => (
          <div key={idx} className={`animate-fadeInUp stagger-${idx + 1}`}>
            <StatCard {...stat} />
          </div>
        ))}
      </section>
      {/* Content Container (Table or Map) */}
      <div className="rounded-2xl glass-card-strong overflow-hidden animate-fadeInUp stagger-5">
        {viewMode === "table" ? (
          <div>
            {/* Table Header */}
            <div className="grid grid-cols-12 border-b border-slate-100/80 bg-slate-50/60 px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <div className="col-span-2 text-start">{t("bin_id")}</div>
              <div className="col-span-6 text-start">{t("location_name")}</div>
              <div className="col-span-2 text-start">{t("bin_status")}</div>
              <div className="col-span-2 text-start">{t("location_time")}</div>
            </div>
            {/* Table Body */}
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <FaInbox className="text-4xl mb-3 text-slate-300" />
                <p className="text-sm font-medium">{t("no_reports")}</p>
                <p className="text-xs text-slate-300 mt-1">
                  Try adjusting your filters
                </p>
              </div>
            ) : (
              filtered.map((b, idx) => (
                <button key={b.id || b.binId} onClick={() => navigate(`/bins-reports/${b.id}`)}
                className={`w-full text-start grid grid-cols-12 px-5 py-4 items-center table-row-hover group animate-fadeIn
                  stagger-${Math.min(idx + 1,8)} cursor-pointer`} style={{ animationDelay: `${Math.min(idx * 40, 320)}ms` }}>
                  <div className="col-span-2 flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-primary/8 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                      <FaTrash className="text-xs" />
                    </div>
                    <span className="font-semibold text-slate-900 text-sm truncate">
                      {b.binId}
                    </span>
                  </div>
                  <div className="col-span-6 min-w-0 pr-2">
                    <p className="text-sm font-medium text-slate-800 truncate">
                      {b.locationName}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {Number(b.latitude).toFixed(4)},{" "}
                      {Number(b.longitude).toFixed(4)}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <Badge tone={getStatusBadgeTone(b.status)}>
                      {getStatusLabel(b.status)}
                    </Badge>
                  </div>
                  <div className="col-span-2 flex items-center justify-between min-w-0">
                    <div>
                      <p className="text-xs text-slate-700">{b.reportDate}</p>
                      <p className="text-[10px] text-slate-400">
                        {b.reportTime}
                      </p>
                    </div>
                    {/* Maps Link */}
                    <a href={`https://www.google.com/maps/search/?api=1&query=${b.latitude},${b.longitude}`} target="_blank"
                    rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                    className="text-xs font-semibold text-primary hover:text-primary-hover border border-primary/20 bg-primary/5 hover:bg-primary/10 rounded-lg px-2.5 py-1.5 transition ml-2 opacity-0 group-hover:opacity-100 cursor-pointer shrink-0">
                      Maps ↗
                    </a>
                  </div>
                </button>
              ))
            )}
          </div>
        ) : (
          <div className="h-[55vh] w-full">
            <BinsMap bins={filtered} />
          </div>
        )}
      </div>
    </div>
  );
}
