import { useMemo, useEffect } from "react";
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
        <MapContainer
            center={[30.0444, 31.2357]}
            zoom={13}
            style={{ height: "100%", width: "100%" }}>
            <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
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
    );
}