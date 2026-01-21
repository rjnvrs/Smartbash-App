"use client"

import { useState } from "react";
import { IncidentCard } from "./IncidentCard";
import type { Incident, IncidentType, UrgencyType } from "./MapView";
import { PanelLeft } from "lucide-react";

interface ClusterDetailsProps {
  clusterIncidents?: Incident[]; // optional array of Incident
}

export function ClusterDetails({ clusterIncidents = [] }: ClusterDetailsProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className={`bg-white rounded-lg shadow-sm p-4 overflow-y-auto transition-all duration-300 ${
        collapsed ? "w-16" : "w-96"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        {!collapsed && (
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Cluster Details
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {clusterIncidents.length} incident{clusterIncidents.length !== 1 ? 's' : ''} in clusters
            </p>
          </div>
        )}

        {/* Toggle Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`h-9 w-9 border rounded-xl flex items-center justify-center hover:bg-gray-100 transition ${
            collapsed ? "mx-auto" : ""
          }`}
        >
          <PanelLeft
            className={`h-5 w-5 transition-transform ${
              collapsed ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {/* Content */}
      {!collapsed && (
        <div>
          {clusterIncidents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No clustered incidents found</p>
              <p className="text-sm mt-1">Incidents in the same location will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {clusterIncidents.map((incident) => (
                <IncidentCard
                  key={incident.id}
                  type={incident.type as IncidentType}
                  urgency={incident.urgency as UrgencyType}
                  reports={incident.reports}
                  location={incident.location}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}