import { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default function CityMap({ reports }) {
    const icons = useMemo(() => {
        const redIcon = new L.Icon({
            iconUrl: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
            iconSize: [32, 32],
        });

        const greenIcon = new L.Icon({
            iconUrl: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
            iconSize: [32, 32],
        });

        return { redIcon, greenIcon };
    }, []);

    return (
        <MapContainer center={[30.0444, 31.2357]} zoom={13} style={{ height: "100%", width: "100%" }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {reports.map((r) => (
                <Marker
                    key={r.id}
                    position={[r.lat, r.lng]}
                    icon={r.priority === "New" ? icons.redIcon : icons.greenIcon}
                >
                    <Popup>
                        <strong>{r.title}</strong><br />
                        Priority: {r.priority}<br />
                        Created at: {r.createdAt}
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}
