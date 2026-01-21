"use client"

import { IncidentMarker } from "./IncidentMarker";
import { IncidentPopup } from "./IncidentPopup";

export type IncidentType = "fire" | "flood";
export type UrgencyType = "Low" | "Moderate" | "High" | "Critical";

export interface Incident {
  id: number;
  type: IncidentType;
  urgency: UrgencyType;
  reports: number;
  location: string;
  lat: number;
  lon: number;
}

interface MapViewProps {
  incidents: Incident[];
  getIncidentColor: (urgency: UrgencyType) => string;
  selectedIncident: Incident | null;
  setSelectedIncident: (incident: Incident | null) => void;
}

export function MapView({ incidents, getIncidentColor, selectedIncident, setSelectedIncident }: MapViewProps) {
  return (
    <div className="flex-1 bg-white rounded-lg shadow-sm relative overflow-hidden">
      
      <div className="w-full h-full bg-gradient-to-br from-blue-50 to-blue-100 relative">
        <div className="w-full h-full bg-blue-50"></div>

        {/* Incident Markers */}
        {incidents.map((incident) => (
          <IncidentMarker
            key={incident.id}
            incident={incident}
            getIncidentColor={getIncidentColor}
            onClick={() => setSelectedIncident(incident)}
          />
        ))}

        {/* Popup for selected incident */}
        {selectedIncident && (
          <IncidentPopup
            incident={selectedIncident}
            onClose={() => setSelectedIncident(null)}
          />
        )}
      </div>
    </div>
  );
}