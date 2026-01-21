"use client"

type IncidentType = 'All' | 'fire' | 'flood';

interface FilterTabsProps {
  selectedType: IncidentType;
  onTypeChange: (value: IncidentType) => void;
}

export function FilterTabs({ selectedType, onTypeChange }: FilterTabsProps) {
  const filters = ['All', 'fire', 'flood']; 
  
  return (
    <div className="flex gap-3 mb-6">
      {filters.map((filter) => (
        <button
          key={filter}
          onClick={() => onTypeChange(filter as IncidentType)}
          className={`px-6 py-2 rounded-full font-medium transition-colors ${
            selectedType === filter
              ? 'bg-black text-white'
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          {filter.charAt(0).toUpperCase() + filter.slice(1)}
        </button>
      ))}
    </div>
  );
}