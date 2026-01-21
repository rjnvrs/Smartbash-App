"use client"

type UrgencyLevel = "Low" | "Moderate" | "High" | "Critical";

interface UrgencyLegendProps {
  getIncidentColor: (level: UrgencyLevel) => string;
}

export function UrgencyLegend({ getIncidentColor }:UrgencyLegendProps) {
  const urgencyLevels: { level: UrgencyLevel; range: string }[] = [
    { level: 'Low', range: '1-3 reports' },
    { level: 'Moderate', range: '4-5 reports' },
    { level: 'High', range: '6-8 reports' },
    { level: 'Critical', range: '9-10+ reports' }
  ];
  
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-3">Urgency Levels</h3>
      <div className="flex gap-8 justify-center gap-24">
        {urgencyLevels.map(({ level, range }) => (
          <div key={level} className="flex flex-col items-center gap-1 mx-24">
            <div className="flex items-center gap-2">
              <div className={`w-5 h-5 rounded-full ${getIncidentColor(level)}`}></div>
              <span className="text-lg font-medium text-gray-900 capitalize">{level}</span>
            </div>
            <span className="text-md text-gray-500">{range}</span>
          </div>
        ))}
      </div>
    </div>
  );
}