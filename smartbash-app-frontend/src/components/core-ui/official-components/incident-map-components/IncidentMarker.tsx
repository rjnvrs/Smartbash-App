"use client";

export type UrgencyLevel = "Low" | "Moderate" | "High" | "Critical";

export interface Incident {
  id: number;
  type: "fire" | "flood";
  urgency: UrgencyLevel;
  reports: number;
  lat: number;
  lon: number;
  location: string;
}

interface IncidentMarkerProps {
  incident: Incident;
  getIncidentColor: (level: UrgencyLevel) => string;

  // ✅ allow coordinates (safe extension)
  onClick?: (x: number, y: number) => void;
}

export function IncidentMarker({
  incident,
  getIncidentColor,
  onClick,
}: IncidentMarkerProps) {
  const x = 150 + (incident.lon - 123.8) * 400;
  const y = 200 + (10.35 - incident.lat) * 800;

  return (
    <div
      className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${x}px`, top: `${y}px` }}
      onClick={() => onClick?.(x, y)}
    >
      <div
        className={`w-10 h-10 rounded-full ${getIncidentColor(
          incident.urgency
        )} flex items-center justify-center text-white font-bold border-4 border-white shadow-lg hover:scale-110 transition-transform`}
      >
        {incident.reports}
      </div>

      {incident.urgency === "Critical" && (
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold">
          !
        </div>
      )}
    </div>
  );
}