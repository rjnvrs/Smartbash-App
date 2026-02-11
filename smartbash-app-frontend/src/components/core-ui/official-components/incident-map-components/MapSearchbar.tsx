"use client";

interface MapSearchBarProps {
  selectedUrgency: "All" | "Low" | "Moderate" | "High" | "Critical";
  onUrgencyChange: (v: MapSearchBarProps["selectedUrgency"]) => void;
  searchQuery: string;
  onSearchChange: (v: string) => void;
}

export function MapSearchBar({
  selectedUrgency,
  onUrgencyChange,
  searchQuery,
  onSearchChange,
}: MapSearchBarProps) {
  const options: MapSearchBarProps["selectedUrgency"][] = [
    "All",
    "Low",
    "Moderate",
    "High",
    "Critical",
  ];

  return (
    <div className="flex items-center bg-white rounded-full shadow px-4 py-2 gap-3">
      <input
        className="flex-1 outline-none text-sm sm:text-base"
        placeholder="Search incidents or locations"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      <select
        value={selectedUrgency}
        onChange={(e) => onUrgencyChange(e.target.value as any)}
        className="bg-transparent outline-none text-sm sm:text-base"
      >
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}