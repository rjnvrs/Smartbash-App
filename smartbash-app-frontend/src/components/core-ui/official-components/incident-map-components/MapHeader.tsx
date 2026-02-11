"use client"

interface MapHeaderProps {
  isDispatching: boolean;
  onAutoDispatch: () => void;
}

export function MapHeader({ isDispatching, onAutoDispatch }: MapHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Geospatial Incident Map</h1>
        <p className="text-gray-500 mt-1">Urgency heatmap</p>
      </div>
      <button
        onClick={onAutoDispatch}
        disabled={isDispatching}
        className="px-6 py-2.5 rounded-lg font-medium transition-colors bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
      >
        {isDispatching ? "Dispatching..." : "Auto Dispatch"}
      </button>
    </div>
  );
}
