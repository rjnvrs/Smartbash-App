"use client";

type UrgencyLevel = "Low" | "Moderate" | "High" | "Critical";

interface UrgencyLegendProps {
  getIncidentColor: (level: UrgencyLevel) => string;
}

export function UrgencyLegend({ getIncidentColor }: UrgencyLegendProps) {
  const urgencyLevels: { level: UrgencyLevel; range: string }[] = [
    { level: "Low", range: "1-3 reports" },
    { level: "Moderate", range: "4-5 reports" },
    { level: "High", range: "6-8 reports" },
    { level: "Critical", range: "9-10+ reports" },
  ];

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-3">
        Urgency Levels
      </h3>

      {/*
        MOBILE (default):
        - stacked
        - readable
        - no overflow

        DESKTOP (sm+):
        - EXACT original layout
      */}
      <div className="flex flex-col gap-4 sm:flex sm:flex-row sm:justify-center sm:gap-24">
        {urgencyLevels.map(({ level, range }) => (
          <div
            key={level}
            className="
              flex flex-row items-center justify-between
              sm:flex-col sm:items-center sm:mx-24
            "
          >
            {/* LEFT (dot + label) */}
            <div className="flex items-center gap-2">
              <div
                className={`w-5 h-5 rounded-full ${getIncidentColor(level)}`}
              />
              <span className="text-lg font-medium text-gray-900 capitalize">
                {level}
              </span>
            </div>

            {/* RIGHT (range) */}
            <span className="text-sm text-gray-500 sm:text-md">
              {range}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
