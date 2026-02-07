"use client";

import { useEffect, useMemo, useState } from "react";
import Sidebar from "../../../../components/core-ui/official-components/Sidebar";
import { MapHeader } from "../../../../components/core-ui/official-components/incident-map-components/MapHeader";
import { FilterTabs } from "../../../../components/core-ui/official-components/incident-map-components/FilterTabs";
import { UrgencyLegend } from "../../../../components/core-ui/official-components/incident-map-components/UrgencyLegend";
import { MapView } from "../../../../components/core-ui/official-components/incident-map-components/MapView";
import { ClusterDetails } from "../../../../components/core-ui/official-components/incident-map-components/ClusterDetails";
import { MapSearchBar } from "../../../../components/core-ui/official-components/incident-map-components/MapSearchbar";
import { apiFetch, parseJsonSafe } from "@/lib/api";

/* TYPES */
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
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [clusterCollapsed, setClusterCollapsed] = useState(false);

  const loadIncidents = async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await apiFetch("/auth/officials/incidents/map/", { method: "GET" });
      const { data, text } = await parseJsonSafe(res);
      if (!res.ok) {
        if (!data) throw new Error(text || "Failed to load incidents");
        throw new Error(data.message || "Failed to load incidents");
      }
      setIncidents((data?.incidents || []) as Incident[]);
    } catch (err: any) {
      setError(err.message || "Failed to load incidents");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadIncidents();
  }, []);

  const filteredIncidents = useMemo(() => {
    return incidents.filter((i) => {
      const typeMatch = selectedType === "All" || i.type === selectedType;
      const urgencyMatch = selectedUrgency === "All" || i.urgency === selectedUrgency;
      const searchMatch =
        !searchQuery ||
        i.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.type.toLowerCase().includes(searchQuery.toLowerCase());
      return typeMatch && urgencyMatch && searchMatch;
    });
  }, [selectedType, selectedUrgency, searchQuery, incidents]);

  const clusterIncidents = useMemo(() => {
    return [...filteredIncidents].sort((a, b) => b.reports - a.reports);
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
      {/* SIDEBAR — DESKTOP ONLY */}
      <div>
        <Sidebar />
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 overflow-y-auto">
        
        {/* HEADER */}
        <div className="bg-white m-3 sm:m-6 rounded-lg shadow-sm p-4 sm:p-6">
          <MapHeader autoDispatch={autoDispatch} setAutoDispatch={setAutoDispatch} />
          <FilterTabs selectedType={selectedType} onTypeChange={setSelectedType} />
          <UrgencyLegend getIncidentColor={getIncidentColor} />
        </div>

        {/* SEARCH — ALWAYS ABOVE MAP */}
        <div className="bg-white mx-3 sm:mx-6 rounded-lg shadow-sm p-3">
          <MapSearchBar
            selectedUrgency={selectedUrgency}
            onUrgencyChange={setSelectedUrgency}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        </div>

        {/* MAP + CLUSTER */}
        <div className="flex flex-col sm:flex-row gap-4 px-3 sm:px-6 mt-4 pb-6">
          
          {/* MAP */}
          <div className="bg-white rounded-lg shadow-sm p-3 flex-1">
            <div className="relative h-[300px] sm:h-[calc(100vh-320px)]">
              {error && (
                <div className="absolute inset-0 flex items-center justify-center text-sm text-red-600">
                  {error}
                </div>
              )}
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-500">
                  Loading incidents...
                </div>
              )}
              <MapView
                incidents={filteredIncidents}
                getIncidentColor={getIncidentColor}
                selectedIncident={selectedIncident}
                setSelectedIncident={setSelectedIncident}
              />
            </div>
          </div>

          {/* CLUSTER DETAILS */}
          {clusterCollapsed ? (
            <button
              onClick={() => setClusterCollapsed(false)}
              className="hidden sm:flex h-10 w-10 rounded-xl border bg-white shadow-sm items-center justify-center"
              aria-label="Open cluster details"
            >
              ⇦
            </button>
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-4 w-full sm:w-96">
              <ClusterDetails
                clusterIncidents={clusterIncidents}
                collapsed={clusterCollapsed}
                onToggle={() => setClusterCollapsed(true)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
