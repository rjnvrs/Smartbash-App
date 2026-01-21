"use client"

interface MapHeaderProps {
  autoDispatch: boolean;
  setAutoDispatch: (value: boolean) => void;
}

export function MapHeader({ autoDispatch, setAutoDispatch }: MapHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Geospatial Incident Map</h1>
        <p className="text-gray-500 mt-1">Urgency heatmap</p>
      </div>
      <button
        onClick={() => setAutoDispatch(!autoDispatch)}
        className={`px-6 py-2.5 rounded-lg font-medium transition-colors ${
          autoDispatch 
            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            : 'bg-red-600 text-white hover:bg-red-700'
        }`}
      >
        Auto Dispatch
      </button>
    </div>
  );
}