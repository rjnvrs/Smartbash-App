"use client"

interface MapSearchBarProps {
  selectedUrgency: "All" | "Low" | "Moderate" | "High" | "Critical";
  onUrgencyChange: (value: "All" | "Low" | "Moderate" | "High" | "Critical") => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export function MapSearchBar({ 
  selectedUrgency, 
  onUrgencyChange,
  searchQuery,
  onSearchChange 
}: MapSearchBarProps) {
  // Options for filters
  const urgencyOptions = ['All', 'Low', 'Moderate', 'High', 'Critical'];

  return (
    <div className="absolute top-4 left-4 z-10 flex flex-col sm:flex-row gap-2 w-full sm:w-auto sm:max-w-3xl">
      {/* Search bar with responsive width */}
      <div className="relative min-w-[900px] w-[480px]">
        <input
          type="text"
          placeholder="Search incidents or locations"
          className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        <svg className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      
      {/* Status Filters - Only urgency now */}
      <div className="flex gap-2">
        <div className="w-36">
          <select
            value={selectedUrgency}
            onChange={(e) => onUrgencyChange(e.target.value as MapSearchBarProps["selectedUrgency"])}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-700 bg-white text-sm"
          >
            {urgencyOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}