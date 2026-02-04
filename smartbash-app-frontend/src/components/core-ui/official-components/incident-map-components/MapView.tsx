"use client";

import { useState, useRef } from "react";
import { IncidentMarker } from "./IncidentMarker";
import { IncidentPopup } from "./IncidentPopup";

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
}

export function MapView({
  incidents,
  getIncidentColor,
  selectedIncident,
  setSelectedIncident,
}: MapViewProps) {
  const [popupPos, setPopupPos] = useState<{ x: number; y: number } | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const startRef = useRef<{ x: number; y: number } | null>(null);

  const startDrag = (x: number, y: number) => {
    startRef.current = { x: x - offset.x, y: y - offset.y };
  };

  const onDrag = (x: number, y: number) => {
    if (!startRef.current) return;
    setOffset({
      x: x - startRef.current.x,
      y: y - startRef.current.y,
    });
  };

  const endDrag = () => {
    startRef.current = null;
  };

  return (
    <div
      className="relative w-full h-full overflow-hidden rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 touch-pan-y"
      onMouseDown={(e) => startDrag(e.clientX, e.clientY)}
      onMouseMove={(e) => onDrag(e.clientX, e.clientY)}
      onMouseUp={endDrag}
      onMouseLeave={endDrag}
      onTouchStart={(e) => startDrag(e.touches[0].clientX, e.touches[0].clientY)}
      onTouchMove={(e) => onDrag(e.touches[0].clientX, e.touches[0].clientY)}
      onTouchEnd={endDrag}
    >
      <div
        className="absolute inset-0"
        style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }}
      >
        {incidents.map((incident) => (
          <IncidentMarker
            key={incident.id}
            incident={incident}
            getIncidentColor={getIncidentColor}
            onClick={(x, y) => {
              setSelectedIncident(incident);
              setPopupPos({ x, y });
            }}
          />
        ))}

        {selectedIncident && popupPos && (
          <IncidentPopup
            incident={selectedIncident}
            position={{
              x: popupPos.x + offset.x,
              y: popupPos.y + offset.y,
            }}
            onClose={() => {
              setSelectedIncident(null);
              setPopupPos(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
