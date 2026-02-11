"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { IncidentPopup } from "./IncidentPopup";

/* ================= LEAFLET ICON FIX ================= */
if (typeof window !== "undefined") {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl:
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
}

export type UrgencyLevel = "Low" | "Moderate" | "High" | "Critical";

export type Incident = {
  id: number;
  type: "fire" | "flood";
  urgency: UrgencyLevel;
  reports: number;
  lat: number;
  lon: number;
  location: string;
};

interface MapViewProps {
  incidents: Incident[];
  getIncidentColor: (urgency: UrgencyLevel) => string;
  selectedIncident: Incident | null;
  setSelectedIncident: (incident: Incident | null) => void;
  onDispatchIncident: (incident: Incident) => void;
}

/* ================= AUTO CENTER MAP TO SHOW ALL PINS ================= */
function FitBounds({ incidents }: { incidents: Incident[] }) {
  const map = useMap();

  useEffect(() => {
    if (incidents.length > 0) {
      const bounds = L.latLngBounds(incidents.map((i) => [i.lat, i.lon]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [incidents, map]);

  return null;
}

/* ================= ZOOM TO SELECTED INCIDENT ================= */
function ZoomToIncident({ selectedIncident }: { selectedIncident: Incident | null }) {
  const map = useMap();

  useEffect(() => {
    if (selectedIncident) {
      // Fly to the marker smoothly
      map.flyTo([selectedIncident.lat, selectedIncident.lon], 15, {
        animate: true,
        duration: 1.5,
      });
    }
  }, [selectedIncident, map]);

  return null;
}

/* ================= MAP VIEW COMPONENT ================= */
export function MapView({
  incidents,
  getIncidentColor,
  selectedIncident,
  setSelectedIncident,
  onDispatchIncident,
}: MapViewProps) {
  const [isBrowser, setIsBrowser] = useState(false);

  useEffect(() => {
    setIsBrowser(true); // Ensure Leaflet runs only in the browser
  }, []);

  const createCustomPinIcon = (incident: Incident) => {
    const colorClass = getIncidentColor(incident.urgency);
    const bgColor = colorClass.includes("green")
      ? "#22c55e"
      : colorClass.includes("yellow")
      ? "#facc15"
      : colorClass.includes("red")
      ? "#ef4444"
      : colorClass.includes("purple")
      ? "#a855f7"
      : "#3b82f6";

    return L.divIcon({
      className: "custom-pin-marker",
      html: `
        <div style="position: relative; width: 48px; height: 48px;">
          <!-- Pin dot/circle -->
          <div style="
            position: absolute;
            top: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 48px;
            height: 48px;
            border-radius: 50%;
            background-color: ${bgColor};
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            border: 4px solid white;
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
            font-size: 16px;
            cursor: pointer;
            transition: transform 0.2s;
          ">
            ${incident.reports}
          </div>
          
          <!-- Critical indicator -->
          ${
            incident.urgency === "Critical"
              ? `<div style="
              position: absolute;
              top: -4px;
              right: 4px;
              width: 20px;
              height: 20px;
              background-color: #dc2626;
              border-radius: 50%;
              border: 2px solid white;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 12px;
              font-weight: bold;
              z-index: 10;
            ">!</div>`
              : ""
          }
          
          <!-- Pin point/stem -->
          <div style="
            position: absolute;
            bottom: -8px;
            left: 50%;
            transform: translateX(-50%);
            width: 0;
            height: 0;
            border-left: 6px solid transparent;
            border-right: 6px solid transparent;
            border-top: 8px solid ${bgColor};
            filter: drop-shadow(0 2px 3px rgb(0 0 0 / 0.2));
          "></div>
        </div>
      `,
      iconSize: [48, 56],
      iconAnchor: [24, 56],
      popupAnchor: [0, -56],
    });
  };

  if (!isBrowser) {
    // Prevent SSR errors
    return <div className="w-full h-full bg-gray-100" />;
  }

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden">
      <MapContainer
        center={[10.3157, 123.8854]} // Cebu City center
        zoom={13}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
        className="rounded-lg"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FitBounds incidents={incidents} />

        {/* Zoom map when a marker is clicked */}
        <ZoomToIncident selectedIncident={selectedIncident} />

        {incidents.map((incident) => (
          <Marker
            key={incident.id}
            position={[incident.lat, incident.lon]}
            icon={createCustomPinIcon(incident)}
            eventHandlers={{
              click: () => setSelectedIncident(incident),
            }}
          />
        ))}
      </MapContainer>

      {selectedIncident && (
        <div className="absolute top-4 left-4 z-[1000]">
          <IncidentPopup
            incident={selectedIncident}
            onClose={() => setSelectedIncident(null)}
            onDispatch={() => onDispatchIncident(selectedIncident)}
          />
        </div>
      )}
    </div>
  );
}
