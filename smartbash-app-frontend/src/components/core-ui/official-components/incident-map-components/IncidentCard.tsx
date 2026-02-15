"use client"

import { Flame, MapPin, Waves, PlaneTakeoff } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type IncidentType = "fire" | "flood";
type UrgencyLevel = "Low" | "Moderate" | "High" | "Critical";

interface IncidentCardProps {
  type: IncidentType;
  urgency: UrgencyLevel;
  reports: number;
  location: string;
}

export function IncidentCard({ type, urgency, reports, location }: IncidentCardProps) {
  // Border color based on type
  const borderColor = type === "fire" ? "border-red-500" : "border-blue-500";
  const icon = type === "fire" ? <Flame className="h-5 w-5 text-red-500" /> 
                               : <Waves className="h-5 w-5 text-blue-500" />;

  // Badge color based on urgency
  const urgencyColors: Record<UrgencyLevel, string> = {
    Low: "bg-green-500 text-white",
    Moderate: "bg-yellow-400 text-white",
    High: "bg-red-400 text-white",
    Critical: "bg-purple-600 text-white",
  };

  const badgeColor = urgencyColors[urgency];

  return (
    <Card className={`border-l-4 ${borderColor} bg-white rounded-lg p-4 shadow-sm`}>
      <CardContent className="p-0">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-gray-500 uppercase">Urgency Level</span>
          <span className={`px-3 py-1 text-xs font-bold rounded-full capitalize ${badgeColor}`}>
            {urgency}
          </span>
        </div>

        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">{icon}</span>
          <span className="font-medium text-gray-900 capitalize">{type}</span>
        </div>

        <div className="text-sm text-gray-600 mb-2 flex items-center gap-1">
          <MapPin className="h-5 w-5 text-gray-500" />
          <span>{reports} reports at this location</span>
        </div>

        <div className="text-sm font-medium text-gray-900 mb-3">
          Location: {location}
        </div>

        <button className="w-full bg-black text-white py-2.5 rounded-full text-sm font-medium hover:bg-gray-800 mb-2 flex items-center justify-center gap-2">
          <PlaneTakeoff className="h-4 w-4" />
          Dispatch Services
        </button>

        <button className="w-full text-gray-600 text-sm hover:text-gray-800">
          Close Details
        </button>
      </CardContent>
    </Card>
  );
}