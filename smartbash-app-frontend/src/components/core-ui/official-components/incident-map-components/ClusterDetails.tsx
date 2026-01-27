"use client";

import { useState } from "react";
import { IncidentCard } from "./IncidentCard";
import type { Incident } from "./MapView";
import { PanelLeft } from "lucide-react";

export function ClusterDetails({
  clusterIncidents = [],
}: {
  clusterIncidents: Incident[];
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`transition-all ${collapsed ? "sm:w-16" : "w-full sm:w-96"}`}>
      <div className="flex items-center justify-between mb-3">
        {!collapsed && (
          <div>
            <h2 className="text-lg font-bold">Cluster Details</h2>
            <p className="text-sm text-gray-500">
              {clusterIncidents.length} incidents
            </p>
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden sm:flex h-9 w-9 border rounded-xl items-center justify-center"
        >
          <PanelLeft className={`h-5 w-5 ${collapsed ? "rotate-180" : ""}`} />
        </button>
      </div>

      {!collapsed && (
        <div className="space-y-3">
          {clusterIncidents.map((i) => (
            <IncidentCard
              key={i.id}
              type={i.type}
              urgency={i.urgency}
              reports={i.reports}
              location={i.location}
            />
          ))}
        </div>
      )}
    </div>
  );
}
