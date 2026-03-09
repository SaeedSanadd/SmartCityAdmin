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
            map.setView(validPoints[0], 16);
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

    return (
        <MapContainer
            center={[30.0444, 31.2357]} // fallback
            zoom={13}
            style={{ height: "100%", width: "100%" }}
        >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

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
                                <strong>{r.type}</strong>
                                <br />
                                City: {r.city}
                                <br />
                                Status: {r.status}
                                <br />
                                Address: {r.address}
                                <br />
                                Notes: {r.notes}
                            </Popup>
                        </Marker>
                    );
                })}
        </MapContainer>
    );
}