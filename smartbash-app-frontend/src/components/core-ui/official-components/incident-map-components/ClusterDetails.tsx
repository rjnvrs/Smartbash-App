"use client";

import { IncidentCard } from "./IncidentCard";
import type { Incident } from "./MapView";
import { PanelLeft } from "lucide-react";

export function ClusterDetails({
  clusterIncidents = [],
  collapsed,
  onToggle,
}: {
  clusterIncidents: Incident[];
  collapsed: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="transition-all w-full sm:w-96">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-lg font-bold">Cluster Details</h2>
          <p className="text-sm text-gray-500">
            {clusterIncidents.length} incidents
          </p>
        </div>

        <button
          onClick={onToggle}
          className="hidden sm:flex h-9 w-9 border rounded-xl items-center justify-center"
        >
          <PanelLeft className={`h-5 w-5 ${collapsed ? "rotate-180" : ""}`} />
        </button>
      </div>

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
    </div>
  );
}
