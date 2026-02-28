import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useState } from 'react';

export default function ReportMap() {
    // Mock data بدل الباك
    const [reports] = useState([
        { id: 1, lat: 30.0626, lng: 31.2497, title: 'Report 1', description: 'Water leakage' },
        { id: 2, lat: 30.0500, lng: 31.2300, title: 'Report 2', description: 'Traffic jam' },
        { id: 3, lat: 30.0444, lng: 31.2357, title: 'Report 3', description: 'Power outage' },
    ]);

    return (
        <MapContainer center={[30.0444, 31.2357]} zoom={12} style={{ height: '500px', width: '100%' }}>
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {reports.map((report) => (
                <Marker key={report.id} position={[report.lat, report.lng]}>
                    <Popup>
                        <strong>{report.title}</strong><br />
                        {report.description}
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}
