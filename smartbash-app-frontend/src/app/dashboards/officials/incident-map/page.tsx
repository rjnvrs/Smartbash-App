"use client";

import { useState, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import { ChevronLeft } from "lucide-react";

// Sidebar and components
import Sidebar from "../../../../components/core-ui/official-components/Sidebar";
import { MapHeader } from "../../../../components/core-ui/official-components/incident-map-components/MapHeader";
import { FilterTabs } from "../../../../components/core-ui/official-components/incident-map-components/FilterTabs";
import { UrgencyLegend } from "../../../../components/core-ui/official-components/incident-map-components/UrgencyLegend";
import { ClusterDetails } from "../../../../components/core-ui/official-components/incident-map-components/ClusterDetails";
import { MapSearchBar } from "../../../../components/core-ui/official-components/incident-map-components/MapSearchbar";
import { apiFetch } from "@/lib/api";

// Types
export type IncidentType = "fire" | "flood";
export type UrgencyType = "Low" | "Moderate" | "High" | "Critical";

export interface Incident {
  id: number;
  type: IncidentType;
  urgency: UrgencyType;
  reports: number;
  lat: number;
  lon: number;
  location: string;
  reportIds?: number[];
}

const geocodeCache: Record<string, { lat: number; lon: number }> = {};

const geocodeLocation = async (location: string) => {
  if (!location) return { lat: 10.3157, lon: 123.8854 };
  if (geocodeCache[location]) return geocodeCache[location];
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(location)}`
  );
  const data = await res.json();
  const value =
    Array.isArray(data) && data.length > 0
      ? { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) }
      : { lat: 10.3157, lon: 123.8854 };
  geocodeCache[location] = value;
  return value;
};

const urgencyFromCount = (count: number): UrgencyType => {
  if (count <= 1) return "Low";
  if (count <= 4) return "Moderate";
  if (count <= 6) return "High";
  return "Critical";
};

// Loading skeleton
function MapLoadingSkeleton() {
  return (
    <div className="relative h-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-lg overflow-hidden">
      <div className="absolute inset-0 animate-pulse" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-gray-300 border-t-blue-500 animate-spin" />
          <p className="text-gray-600 font-medium">Loading map...</p>
        </div>
      </div>
    </div>
  );
}

// Dynamically import MapView (fixes `window is not defined` issue)
const MapView = dynamic(
  () => import("../../../../components/core-ui/official-components/incident-map-components/MapView").then((mod) => mod.MapView),
  { ssr: false }
);

export default function IncidentMap() {
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [isDispatching, setIsDispatching] = useState(false);
  const [selectedType, setSelectedType] = useState<IncidentType | "All">("All");
  const [selectedUrgency, setSelectedUrgency] = useState<UrgencyType | "All">("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [allIncidents, setAllIncidents] = useState<Incident[]>([]);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isMapLoading, setIsMapLoading] = useState(true);
  const [dismissedIncidentIds, setDismissedIncidentIds] = useState<number[]>([]);

  const loadIncidents = async () => {
    try {
      const res = await apiFetch("/auth/officials/incidents/map/", { method: "GET" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load incidents");
      const rawIncidents = (data.incidents || []) as Array<{
        id: number;
        type: IncidentType;
        urgency: UrgencyType;
        reports: number;
        lat: number | null;
        lon: number | null;
        location: string;
        reportIds?: number[];
      }>;

      const mapped: Incident[] = [];
      for (const item of rawIncidents) {
        let lat = item.lat;
        let lon = item.lon;
        if (
          lat === null ||
          lon === null ||
          Number.isNaN(Number(lat)) ||
          Number.isNaN(Number(lon))
        ) {
          const coords = await geocodeLocation(item.location || "");
          lat = coords.lat;
          lon = coords.lon;
        }
        mapped.push({
          id: item.id,
          type: item.type,
          urgency: item.urgency || urgencyFromCount(item.reports || 1),
          reports: item.reports || (item.reportIds?.length || 1),
          lat: Number(lat),
          lon: Number(lon),
          location: item.location || "",
          reportIds: item.reportIds || [item.id],
        });
      }
      setAllIncidents(mapped);
    } catch {
      setAllIncidents([]);
    }
  };

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Simulate map loading
  useEffect(() => {
    const timer = setTimeout(() => setIsMapLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    loadIncidents();
  }, []);

  const handleAutoDispatch = async () => {
    setIsDispatching(true);
    try {
      await apiFetch("/auth/officials/reports/dispatch-all/", { method: "POST" });
      await loadIncidents();
    } finally {
      setIsDispatching(false);
    }
  };

  const handleDispatchIncident = async (incident: Incident) => {
    const ids = incident.reportIds && incident.reportIds.length > 0 ? incident.reportIds : [incident.id];
    for (const id of ids) {
      await apiFetch("/auth/officials/reports/dispatch/", {
        method: "POST",
        body: JSON.stringify({ id }),
      });
    }
    await loadIncidents();
    setSelectedIncident(null);
  };

  const handleDispatchIncidentById = async (incidentId: number) => {
    const incident = allIncidents.find((item) => item.id === incidentId);
    if (!incident) return;
    await handleDispatchIncident(incident);
  };

  const handleCloseIncidentById = (incidentId: number) => {
    setDismissedIncidentIds((prev) => [...prev, incidentId]);
    if (selectedIncident?.id === incidentId) setSelectedIncident(null);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      loadIncidents();
    }, 3000);

    const onVisible = () => {
      if (document.visibilityState === "visible") {
        loadIncidents();
      }
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  const filteredIncidents = useMemo(() => {
    return allIncidents.filter((i) => {
      if (dismissedIncidentIds.includes(i.id)) return false;
      const typeMatch = selectedType === "All" || i.type === selectedType;
      const urgencyMatch = selectedUrgency === "All" || i.urgency === selectedUrgency;
      const searchMatch = !searchQuery || i.location.toLowerCase().includes(searchQuery.toLowerCase()) || i.type.toLowerCase().includes(searchQuery.toLowerCase());
      return typeMatch && urgencyMatch && searchMatch;
    });
  }, [allIncidents, dismissedIncidentIds, selectedType, selectedUrgency, searchQuery]);

  const getIncidentColor = (urgency: UrgencyType) => {
    const colors = { Low: "bg-green-500", Moderate: "bg-yellow-400", High: "bg-red-500", Critical: "bg-purple-500" };
    return colors[urgency];
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="hidden sm:block">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white m-3 sm:m-6 rounded-lg shadow-sm p-4 sm:p-6 flex-shrink-0">
          <MapHeader isDispatching={isDispatching} onAutoDispatch={handleAutoDispatch} />
          <FilterTabs selectedType={selectedType} onTypeChange={setSelectedType} />
          <UrgencyLegend getIncidentColor={getIncidentColor} />
        </div>

        {/* Search */}
        <div className="bg-white mx-3 sm:mx-6 rounded-lg shadow-sm p-3 flex-shrink-0">
          <MapSearchBar selectedUrgency={selectedUrgency} onUrgencyChange={setSelectedUrgency} searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        </div>

        {/* Map + Cluster Panel */}
        <div className={`flex-1 flex flex-col sm:flex-row gap-4 px-3 sm:px-6 mt-4 pb-6 min-h-0 ${isMobile ? "" : "overflow-hidden"}`}>
          {/* Map */}
          <div className="bg-white rounded-lg shadow-sm p-3 flex-1 relative">
            <div className="relative h-[300px] sm:h-full">
              {isMapLoading ? (
                <MapLoadingSkeleton />
              ) : (
                <MapView
                  incidents={filteredIncidents}
                  getIncidentColor={getIncidentColor}
                  selectedIncident={selectedIncident}
                  setSelectedIncident={setSelectedIncident}
                  onDispatchIncident={handleDispatchIncident}
                />
              )}
            </div>
          </div>

          {/* Cluster Panel */}
          {filteredIncidents.length > 0 && (
            <>
              {/* Expand button for desktop */}
              {!isMobile && isPanelCollapsed && (
                <button onClick={() => setIsPanelCollapsed(false)} className="w-16 bg-white rounded-lg shadow-sm flex items-center justify-center hover:bg-gray-100">
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
              )}

              {/* Scrollable cluster panel */}
              {!isPanelCollapsed && (
                <div
                  className={`bg-white rounded-lg shadow-sm flex-shrink-0 flex flex-col ${
                    isMobile ? "w-full max-h-[400px] overflow-y-auto" : "w-96 overflow-y-auto"
                  }`}
                  style={isMobile ? {} : { maxHeight: "calc(100vh - 160px)" }}
                >
                  <ClusterDetails
                    clusterIncidents={filteredIncidents}
                    onCollapse={() => setIsPanelCollapsed(true)}
                    onDispatchIncident={handleDispatchIncidentById}
                    onCloseIncident={handleCloseIncidentById}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
