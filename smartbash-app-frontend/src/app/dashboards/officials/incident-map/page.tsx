"use client";

import { useState, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import { ChevronLeft } from "lucide-react";

import Sidebar from "../../../../components/core-ui/official-components/Sidebar";
import { MapHeader } from "../../../../components/core-ui/official-components/incident-map-components/MapHeader";
import { FilterTabs } from "../../../../components/core-ui/official-components/incident-map-components/FilterTabs";
import { UrgencyLegend } from "../../../../components/core-ui/official-components/incident-map-components/UrgencyLegend";
import { ClusterDetails } from "../../../../components/core-ui/official-components/incident-map-components/ClusterDetails";
import { MapSearchBar } from "../../../../components/core-ui/official-components/incident-map-components/MapSearchbar";
import { apiFetch } from "@/lib/api";

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
}

type ApiIncident = {
  id: number;
  type: string;
  urgency: string;
  reports: number;
  lat: number | null;
  lon: number | null;
  location: string;
};

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

const MapView = dynamic(
  () =>
    import("../../../../components/core-ui/official-components/incident-map-components/MapView").then(
      (mod) => mod.MapView
    ),
  { ssr: false }
);

const normalizeType = (value: string): IncidentType =>
  value?.toLowerCase() === "flood" ? "flood" : "fire";

const normalizeUrgency = (value: string): UrgencyType => {
  if (value === "Low" || value === "Moderate" || value === "High" || value === "Critical") {
    return value;
  }
  return "Low";
};

export default function IncidentMap() {
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [autoDispatch, setAutoDispatch] = useState(false);
  const [selectedType, setSelectedType] = useState<IncidentType | "All">("All");
  const [selectedUrgency, setSelectedUrgency] = useState<UrgencyType | "All">("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [allIncidents, setAllIncidents] = useState<Incident[]>([]);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isMapLoading, setIsMapLoading] = useState(true);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadIncidents = async () => {
      setIsMapLoading(true);
      try {
        const res = await apiFetch("/auth/officials/incidents/map/", { method: "GET" });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || "Failed to load map incidents");

        const normalized: Incident[] = ((data?.incidents || []) as ApiIncident[])
          .filter((row) => row.lat !== null && row.lon !== null)
          .map((row) => ({
            id: Number(row.id),
            type: normalizeType(row.type),
            urgency: normalizeUrgency(row.urgency),
            reports: Number(row.reports || 0),
            lat: Number(row.lat),
            lon: Number(row.lon),
            location: row.location || "",
          }));

        if (!cancelled) {
          setAllIncidents(normalized);
          setSelectedIncident((prev) => {
            if (!prev) return null;
            return normalized.find((x) => x.id === prev.id) || null;
          });
        }
      } catch {
        if (!cancelled) {
          setAllIncidents([]);
          setSelectedIncident(null);
        }
      } finally {
        if (!cancelled) setIsMapLoading(false);
      }
    };

    loadIncidents();
    const timer = setInterval(loadIncidents, 10000);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

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
  }, [allIncidents, selectedType, selectedUrgency, searchQuery]);

  const getIncidentColor = (urgency: UrgencyType) => {
    const colors = {
      Low: "bg-green-500",
      Moderate: "bg-yellow-400",
      High: "bg-red-500",
      Critical: "bg-purple-500",
    };
    return colors[urgency];
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white m-3 sm:m-6 rounded-lg shadow-sm p-4 sm:p-6 flex-shrink-0">
          <MapHeader autoDispatch={autoDispatch} setAutoDispatch={setAutoDispatch} />
          <FilterTabs selectedType={selectedType} onTypeChange={setSelectedType} />
          <UrgencyLegend getIncidentColor={getIncidentColor} />
        </div>

        <div className="bg-white mx-3 sm:mx-6 rounded-lg shadow-sm p-3 flex-shrink-0">
          <MapSearchBar
            selectedUrgency={selectedUrgency}
            onUrgencyChange={setSelectedUrgency}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        </div>

        <div className={`flex-1 flex flex-col sm:flex-row gap-4 px-3 sm:px-6 mt-4 pb-6 min-h-0 ${isMobile ? "" : "overflow-hidden"}`}>
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
                />
              )}
            </div>
          </div>

          {filteredIncidents.length > 0 && (
            <>
              {!isMobile && isPanelCollapsed && (
                <button
                  onClick={() => setIsPanelCollapsed(false)}
                  className="w-16 bg-white rounded-lg shadow-sm flex items-center justify-center hover:bg-gray-100"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
              )}

              {!isPanelCollapsed && (
                <div
                  className={`bg-white rounded-lg shadow-sm flex-shrink-0 flex flex-col ${
                    isMobile ? "w-full max-h-[400px] overflow-y-auto" : "w-96 overflow-y-auto"
                  }`}
                  style={isMobile ? {} : { maxHeight: "calc(100vh - 160px)" }}
                >
                  <ClusterDetails
                    clusterIncidents={filteredIncidents}
                    onCollapse={() => !isMobile && setIsPanelCollapsed(true)}
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
