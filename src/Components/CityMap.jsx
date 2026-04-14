import { useMemo, useEffect } from "react";
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    useMap
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useNavigate  } from "react-router-dom";
// 🔥 Fix default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
    iconUrl:
        "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    shadowUrl:
        "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

// 🔥 Component responsible for auto zoom
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
            center={[30.0444, 31.2357]} // fallback
            zoom={13}
            style={{ height: "100%", width: "100%" }}
        >
            <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />


            {/* 🔥 auto zoom logic */}
            <FitBounds reports={reports} />

            {reports &&
                reports.map((r) => {
                    if (!r.lat || !r.lng) return null;

                    return (
                        <Marker
                            key={r.id}
                            position={[Number(r.lat), Number(r.lng)]}
                            icon={icons[r.status] || icons.pending}
                        >
                            <Popup>
                                <div className="p-4 w-[250px] text-sm">

                                    {/* Title */}
                                    <p
                                        onClick={() => navigate(`/reports/${r.id}`)}
                                        className="font-semibold text-blue-600 cursor-pointer hover:underline text-lg mb-3"
                                    >
                                        {r.type}
                                    </p>

                                    {/* Info */}
                                    <div className="space-y-2 text-gray-600">

                                        <div className="flex items-center gap-2">
                                            <span>🏙️</span>
                                            <span>
                                                <span className="font-medium text-gray-800">City:</span> {r.city}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <span>⚡</span>
                                            <span className="font-medium text-gray-800">Status:</span>
                                            <span
                                                className={`ml-1 px-2 py-0.5 rounded-md text-xs font-medium
                        ${r.status === "pending" && "bg-red-50 text-red-600"}
                        ${r.status === "in_progress" && "bg-yellow-50 text-yellow-700"}
                        ${r.status === "resolved" && "bg-green-50 text-green-600"}
                    `}
                                            >
                                                {r.status}
                                            </span>
                                        </div>

                                        <div className="flex items-start gap-2">
                                            <span className="mt-0.5">📍</span>
                                            <span>
                                                <span className="font-medium text-gray-800">Address:</span> {r.address}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Divider */}
                                    {r.notes && (
                                        <>
                                            <div className="border-t my-3"></div>
                                            <p className="text-gray-500 text-xs leading-relaxed">
                                                {r.notes}
                                            </p>
                                        </>
                                    )}

                                </div>
                            </Popup>


                        </Marker>
                    );
                })}
        </MapContainer>
    );
}