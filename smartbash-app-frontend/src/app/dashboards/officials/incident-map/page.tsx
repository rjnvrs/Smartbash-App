"use client";

import { useState, useMemo } from "react";
import Sidebar from "../../../../components/core-ui/official-components/Sidebar";
import { MapHeader } from "../../../../components/core-ui/official-components/incident-map-components/MapHeader";
import { FilterTabs } from "../../../../components/core-ui/official-components/incident-map-components/FilterTabs";
import { UrgencyLegend } from "../../../../components/core-ui/official-components/incident-map-components/UrgencyLegend";
import { MapView } from "../../../../components/core-ui/official-components/incident-map-components/MapView";
import { ClusterDetails } from "../../../../components/core-ui/official-components/incident-map-components/ClusterDetails";
import { MapSearchBar } from "../../../../components/core-ui/official-components/incident-map-components/MapSearchbar";

export type IncidentType = "fire" | "flood";
export type UrgencyType = "Low" | "Moderate" | "High" | "Critical";

export interface Incident {
  id: number;
  type: IncidentType;
  urgency: UrgencyType;
  lat: number;
  lon: number;
  reports: number;
  location: string;
}

export default function IncidentMap() {
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [autoDispatch, setAutoDispatch] = useState(false);
  const [selectedType, setSelectedType] = useState<IncidentType | "All">("All");
  const [selectedUrgency, setSelectedUrgency] = useState<UrgencyType | "All">("All");
  const [searchQuery, setSearchQuery] = useState("");

  const allIncidents: Incident[] = [
    { id: 1, type: "fire", urgency: "High", lat: 10.3, lon: 123.9, reports: 9, location: "Basak Pardo, Cebu City" },
    { id: 2, type: "flood", urgency: "High", lat: 10.35, lon: 123.92, reports: 8, location: "Basak Pardo, Cebu City" },
    { id: 3, type: "fire", urgency: "Critical", lat: 10.32, lon: 123.88, reports: 10, location: "Labangon, Cebu City" },
    { id: 4, type: "flood", urgency: "Moderate", lat: 10.28, lon: 123.85, reports: 3, location: "Talisay City" },
    { id: 5, type: "fire", urgency: "Low", lat: 10.25, lon: 123.83, reports: 1, location: "San Fernando" },
    { id: 6, type: "fire", urgency: "Moderate", lat: 10.31, lon: 123.91, reports: 5, location: "Basak Pardo, Cebu City" },
    { id: 7, type: "flood", urgency: "High", lat: 10.33, lon: 123.89, reports: 7, location: "Basak Pardo, Cebu City" },
    { id: 8, type: "fire", urgency: "Critical", lat: 10.31, lon: 123.87, reports: 12, location: "Labangon, Cebu City" },
  ];

  const filteredIncidents = useMemo(() => {
    return allIncidents.filter((i) => {
      const typeMatch = selectedType === "All" || i.type === selectedType;
      const urgencyMatch = selectedUrgency === "All" || i.urgency === selectedUrgency;
      const searchMatch =
        !searchQuery ||
        i.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.type.toLowerCase().includes(searchQuery.toLowerCase());
      return typeMatch && urgencyMatch && searchMatch;
    });
  }, [selectedType, selectedUrgency, searchQuery]);

  const clusterIncidents = useMemo(() => {
    const count: Record<string, number> = {};
    filteredIncidents.forEach((i) => {
      count[i.location] = (count[i.location] || 0) + 1;
    });
    return filteredIncidents.filter((i) => count[i.location] > 1);
  }, [filteredIncidents]);

  const getIncidentColor = (urgency: UrgencyType) => {
    const colors: Record<UrgencyType, string> = {
      Low: "bg-green-500",
      Moderate: "bg-yellow-400",
      High: "bg-red-500",
      Critical: "bg-purple-500",
    };
    return colors[urgency];
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="hidden sm:block">
        <Sidebar />
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="bg-white m-3 sm:m-6 rounded-lg shadow-sm p-4 sm:p-6">
          <MapHeader autoDispatch={autoDispatch} setAutoDispatch={setAutoDispatch} />
          <FilterTabs selectedType={selectedType} onTypeChange={setSelectedType} />
          <UrgencyLegend getIncidentColor={getIncidentColor} />
        </div>

        <div className="bg-white mx-3 sm:mx-6 rounded-lg shadow-sm p-3">
          <MapSearchBar
            selectedUrgency={selectedUrgency}
            onUrgencyChange={setSelectedUrgency}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4 px-3 sm:px-6 mt-4 pb-6">
          <div className="bg-white rounded-lg shadow-sm p-3 flex-1">
            <div className="relative h-[300px] sm:h-[calc(100vh-320px)]">
              <MapView
                incidents={filteredIncidents}
                getIncidentColor={getIncidentColor}
                selectedIncident={selectedIncident}
                setSelectedIncident={setSelectedIncident}
              />
            </div>
          </div>

          {clusterIncidents.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-4 w-full sm:w-96">
              <ClusterDetails clusterIncidents={clusterIncidents} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
