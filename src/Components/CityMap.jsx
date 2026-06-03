import { useMemo, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useNavigate } from "react-router-dom";
import Badge, { statusTone } from "./Badge";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
    iconUrl:
        "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    shadowUrl:
        "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

function FitBounds({ reports }) {
    const map = useMap();
    useEffect(() => {
        if (!reports || reports.length === 0) return;
        const validPoints = reports
            .filter(r => r.lat && r.lng)
            .map(r => [Number(r.lat), Number(r.lng)]);
        if (validPoints.length === 0) return;
        if (validPoints.length === 1) {
            map.setView(validPoints[0], 11);
        } else {
            const bounds = L.latLngBounds(validPoints);
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [reports, map]);
    return null;
}

export default function CityMap({ reports }) {
    const { t } = useTranslation();
    const [mapMode, setMapMode] = useState("satellite");

    const icons = useMemo(() => {
        return {
            pending: new L.Icon({
                iconUrl: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
                iconSize: [32, 32],
            }),
            in_progress: new L.Icon({
                iconUrl: "https://maps.google.com/mapfiles/ms/icons/yellow-dot.png",
                iconSize: [32, 32],
            }),
            resolved: new L.Icon({
                iconUrl: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
                iconSize: [32, 32],
            }),
        };
    }, []);

    const navigate = useNavigate();

    return (
        <div className="relative w-full h-full">
            {/* Custom Map Mode Toggle */}
            <div className={`absolute top-3 ${document.documentElement.dir === 'rtl' ? 'left-3' : 'right-3'} z-[1000] flex bg-white/95 backdrop-blur-sm p-1 rounded-xl shadow-md border border-slate-200/50`}>
                <button
                    onClick={() => setMapMode("satellite")}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all duration-200 cursor-pointer ${mapMode === "satellite" ? "bg-primary text-white shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"}`}
                >
                    {t("satellite") || "Satellite"}
                </button>
                <button
                    onClick={() => setMapMode("street")}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all duration-200 cursor-pointer ${mapMode === "street" ? "bg-primary text-white shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"}`}
                >
                    {t("street") || "Street"}
                </button>
            </div>

            <MapContainer
                center={[30.0444, 31.2357]}
                zoom={13}
                style={{ height: "100%", width: "100%" }}>
                {mapMode === "satellite" ? (
                    <>
                        <TileLayer
                            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
                        <TileLayer
                            url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}" />
                    </>
                ) : (
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                )}
                <FitBounds reports={reports} />
            {reports &&
                reports.map((r) => {
                    if (!r.lat || !r.lng) return null;
                    return (
                        <Marker
                            key={r.id}
                            position={[Number(r.lat), Number(r.lng)]}
                            icon={icons[r.status] || icons.pending}>
                            <Popup>
                                <div className="p-4 w-64">
                                    {/* Title */}
                                    <p
                                        onClick={() => navigate(`/reports/${r.id}`)}
                                        className="font-bold text-primary cursor-pointer hover:underline text-base mb-2.5 tracking-tight">
                                        {r.type}
                                    </p>

                                    {/* Info */}
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="text-slate-400">🏙️</span>
                                            <span className="text-slate-600">
                                                <span className="font-semibold text-slate-700">City:</span> {r.city}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="text-slate-400">⚡</span>
                                            <span className="font-semibold text-slate-700">Status:</span>
                                            <Badge tone={statusTone(r.status)}>
                                                {r.status}
                                            </Badge>
                                        </div>

                                        <div className="flex items-start gap-2 text-sm">
                                            <span className="text-slate-400 mt-0.5">📍</span>
                                            <span className="text-slate-600">
                                                <span className="font-semibold text-slate-700">Address:</span> {r.address}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Notes */}
                                    {r.notes && (
                                        <>
                                            <div className="border-t border-slate-100 my-3" />
                                            <p className="text-slate-400 text-xs leading-relaxed">
                                                {r.notes}
                                            </p>
                                        </>
                                    )}

                                    {/* View details link */}
                                    <button
                                        onClick={() => navigate(`/reports/${r.id}`)}
                                        className="mt-3 w-full text-center text-xs font-semibold text-primary hover:text-primary-hover transition py-1.5 rounded-lg bg-primary/5 hover:bg-primary/10"
                                    >
                                        View Details →
                                    </button>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
        </MapContainer>
        </div>
    );
}