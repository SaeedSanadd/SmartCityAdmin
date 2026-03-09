import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// 🔥 Fix marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
    iconUrl:
        "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    shadowUrl:
        "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

export default function CityMap({ reports }) {
    return (
        <MapContainer
            center={[30.0444, 31.2357]}
            zoom={12}
            style={{ height: "500px", width: "100%" }}
        >
            <TileLayer url="https://{s}.tile.openstreetmap.org/%7Bz%7D/%7Bx%7D/%7By%7D.png" />

            {reports &&
                reports.map((report) => {
                    if (!report.lat || !report.lng) return null;

                    return (
                        <Marker
                            key={report.id}
                            position={[report.lat, report.lng]}
                        >
                            <Popup>
                                <strong>{report.type}</strong>
                                <br />
                                {report.city}
                                <br />
                                Status: {report.status}
                                <br />
                                {report.notes}
                            </Popup>
                        </Marker>
                    );
                })}
        </MapContainer>
    );
}