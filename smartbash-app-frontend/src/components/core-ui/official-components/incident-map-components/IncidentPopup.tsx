"use client"

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

interface IncidentPopupProps {
  incident: Incident;
  onClose: () => void;
  getIncidentColor?: (level: UrgencyLevel) => string; // optional, for consistent color logic
}

export function IncidentPopup({ incident, onClose }: IncidentPopupProps) {
  return (
    <div
      className="absolute bg-white rounded-lg shadow-xl p-4 border-l-4 z-20"
      style={{ 
        left: '100px', 
        top: '300px',
        borderLeftColor: incident.urgency === 'High' ? '#ef4444' : '#3b82f6'
      }}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-gray-500 uppercase">Urgency Level</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold text-white ${
              incident.urgency === 'High' ? 'bg-red-500' : 'bg-blue-500'
            }`}>
              {incident.urgency}
            </span>
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-700">
            <span className="font-bold">{incident.type === 'fire' ? '🔥' : '🌊'}</span>
            <span className="capitalize">{incident.type}</span>
          </div>
        </div>
      </div>
      <div className="text-xs text-gray-500 mb-2">
        📍 {incident.reports} reports at this location
      </div>
      <div className="text-sm font-medium text-gray-900 mb-3">
        Location: {incident.location}
      </div>
      <button className="w-full bg-black text-white py-2 rounded-full text-sm font-medium hover:bg-gray-800 mb-2">
        ✈️ Dispatch Services
      </button>
      <button 
        onClick={onClose}
        className="w-full text-gray-600 text-sm hover:text-gray-800"
      >
        Close Details
      </button>
    </div>
  );
}