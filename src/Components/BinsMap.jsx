import { useMemo, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useNavigate } from "react-router-dom";
import Badge from "./Badge";

// Fix for default Leaflet icon paths
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

function FitBounds({ bins }) {
  const map = useMap();
  useEffect(() => {
    if (!bins || bins.length === 0) return;
    const validPoints = bins
      .filter((b) => b.latitude && b.longitude)
      .map((b) => [Number(b.latitude), Number(b.longitude)]);
    if (validPoints.length === 0) return;
    if (validPoints.length === 1) {
      map.setView(validPoints[0], 13);
    } else {
      const bounds = L.latLngBounds(validPoints);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [bins, map]);
  return null;
}
export default function BinsMap({ bins }) {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [mapMode, setMapMode] = useState("satellite");
  const icons = useMemo(() => {
    return {
      FULL: new L.Icon({
        iconUrl: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      }),
      NORMAL: new L.Icon({
        iconUrl: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      }),
      DEFAULT: new L.Icon({
        iconUrl: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      }),
    };
  }, []);
  const getStatusBadgeTone = (status) => {
    return status === "FULL" ? "danger" : "success";
  };
  const getStatusLabel = (status) => {
    if (status === "FULL") return t("full");
    return t("normal");
  };
  return (
    <div className="relative w-full h-full">
      {/* Custom Map Mode Toggle */}
      <div
        className={`absolute top-3 ${
          i18n.language === "ar" ? "left-3" : "right-3"
        } z-[1000] flex bg-white/95 backdrop-blur-sm p-1 rounded-xl shadow-md border border-slate-200/50`}>
        <button
          onClick={() => setMapMode("satellite")}
          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all duration-200 cursor-pointer ${
            mapMode === "satellite"
              ? "bg-primary text-white shadow-sm"
              : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"}`}>
          {t("satellite") || "Satellite"}
        </button>
        <button
          onClick={() => setMapMode("street")}
          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all duration-200 cursor-pointer ${
            mapMode === "street"
              ? "bg-primary text-white shadow-sm"
              : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"}`}>
          {t("street") || "Street"}
        </button>
      </div>

      <MapContainer
        center={[30.0444, 31.2357]}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
      >
        {mapMode === "satellite" ? (
          <>
            <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
            <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}" />
          </>
        ) : (
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
        )}
        <FitBounds bins={bins} />
        {bins &&
          bins.map((b) => {
            if (!b.latitude || !b.longitude) return null;
            const markerIcon =
              b.status === "FULL" ? icons.FULL : icons.NORMAL;
            return (
              <Marker
                key={b.id || b.binId}
                position={[Number(b.latitude), Number(b.longitude)]}
                icon={markerIcon}
              >
                <Popup>
                  <div className="p-4 w-64">
                    {/* Title */}
                    <p className="font-bold text-primary text-base mb-2.5 tracking-tight">
                      {b.binId}
                    </p>

                    {/* Info */}
                    <div className="space-y-2">
                      <div className="flex items-start gap-2 text-sm">
                        <span className="text-slate-400">🏙️</span>
                        <span className="text-slate-600">
                          <span className="font-semibold text-slate-700">
                            {t("location_name")}:
                          </span>{" "}
                          {b.locationName}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-slate-400">⚡</span>
                        <span className="font-semibold text-slate-700">
                          {t("bin_status")}:
                        </span>
                        <Badge tone={getStatusBadgeTone(b.status)}>
                          {getStatusLabel(b.status)}
                        </Badge>
                      </div>



                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-slate-400">📅</span>
                        <span className="text-slate-600">
                          <span className="font-semibold text-slate-700">
                            {t("location_time")}:
                          </span>{" "}
                          {b.reportDate} {b.reportTime}
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 my-3" />

                    {/* Google Maps link */}
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${b.latitude},${b.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full text-center text-xs font-semibold text-white bg-primary hover:bg-primary-hover transition py-2 rounded-lg"
                    >
                      Google Maps ↗
                    </a>

                    {/* View details button */}
                    <button
                      onClick={() => navigate(`/bins-reports/${b.id}`)}
                      className="mt-2 block w-full text-center text-xs font-semibold text-primary hover:text-primary-hover transition py-2 rounded-lg bg-primary/5 hover:bg-primary/10 border border-primary/10 cursor-pointer"
                    >
                      {t("view_details") || "View Details"} →
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
