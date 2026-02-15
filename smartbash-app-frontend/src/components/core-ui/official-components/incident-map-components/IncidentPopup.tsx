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

interface IncidentPopupProps {
  incident: Incident;
  onClose: () => void;
  position?: { x: number; y: number };
}

export function IncidentPopup({ incident, onClose, position }: IncidentPopupProps) {
  const getUrgencyColor = () => {
    switch (incident.urgency) {
      case "High":
        return "#ef4444"; // red
      case "Critical":
        return "#a855f7"; // purple
      case "Moderate":
        return "#facc15"; // yellow
      default:
        return "#13ac41"; // blue (Low)
    }
  };

  const getUrgencyBadge = () => {
    switch (incident.urgency) {
      case "High":
        return "bg-red-500";
      case "Critical":
        return "bg-purple-500";
      case "Moderate":
        return "bg-yellow-400";
      default:
        return "bg-green-500";
    }
  };

  return (
    <>
      {/* Mobile backdrop (only on mobile) */}
      <div
        className="fixed inset-0 bg-black/20 z-10 lg:hidden"
        onClick={onClose}
      />
      
      {/* Popup */}
      <div
        className="fixed lg:absolute z-20 w-[calc(100vw-32px)] max-w-sm lg:w-64 bg-white rounded-xl shadow-lg border-l-4 overflow-hidden"
        style={{
          // Mobile positioning
          ...(!position ? {} : {
            left: '60%',
            top: 'auto',
            bottom: '16px',
            transform: 'translateX(-50%)',
          }),
          // Desktop positioning (overrides mobile)
          ...(position && typeof window !== 'undefined' && window.innerWidth >= 1024 ? {
            left: `${position.x + 12}px`,
            top: `${position.y - 12}px`,
            bottom: 'auto',
            transform: 'none',
          } : {}),
          // Fallback for desktop without position
          ...(!position && typeof window !== 'undefined' && window.innerWidth >= 1024 ? {
            left: "600px",
            top: "400px",
          } : {}),
          borderLeftColor: getUrgencyColor(),
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-start p-4 sm:p-3">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-500 uppercase">
                Urgency
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-bold text-white ${getUrgencyBadge()}`}
              >
                {incident.urgency}
              </span>
            </div>

            <div className="flex items-center gap-1 text-sm text-gray-700 mt-1">
              <span>{incident.type === "fire" ? "🔥" : "🌊"}</span>
              <span className="capitalize">{incident.type}</span>
            </div>
          </div>

          {/* Close Button - larger on mobile for touch */}
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition text-lg lg:text-sm font-medium p-1"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="px-4 pb-4 space-y-2 text-gray-700 text-sm">
          <div>
            📍 {incident.reports} report{incident.reports > 1 ? "s" : ""} at this location
          </div>
          <div className="font-medium text-gray-900 truncate">
            Location: {incident.location}
          </div>
        </div>

        {/* Action */}
        <div className="px-4 pb-4">
          <button className="w-full bg-black text-white py-3 lg:py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition active:scale-95 lg:active:scale-100">
            ✈️ Dispatch Services
          </button>
        </div>
      </div>
    </>
  );
}