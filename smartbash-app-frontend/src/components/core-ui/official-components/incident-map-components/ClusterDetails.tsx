"use client";

import { IncidentCard } from "./IncidentCard";
import type { Incident } from "./MapView";
import { PanelRightClose } from "lucide-react";

export function ClusterDetails({
  clusterIncidents = [],
  onCollapse,
}: {
  clusterIncidents: Incident[];
  onCollapse?: () => void;
}) {
  return (
    <div className="flex flex-col h-full w-full min-h-0">
      {/* Header - Fixed */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-gray-900">
            Cluster Details
          </h2>
          <p className="text-sm text-gray-500">
            {clusterIncidents.length} incident{clusterIncidents.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={onCollapse}
          className="flex-shrink-0 ml-2 bg-white hover:bg-gray-100 border-2 border-gray-200 rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-110"
          aria-label="Collapse panel"
        >
          <PanelRightClose className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto min-h-0 p-4">
        {clusterIncidents.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="font-semibold">No incidents found</p>
            <p className="text-sm mt-1">Adjust your filters to see results</p>
          </div>
        ) : (
          <div className="space-y-3 pr-2">
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
    </div>
  );
}