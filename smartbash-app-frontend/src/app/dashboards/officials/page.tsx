"use client";

import { useState } from "react";
import Sidebar from "../../../components/core-ui/official-components/Sidebar";
import Topbar from "../../../components/core-ui/official-components/Topbar";
import StatCards from "../../../components/core-ui/official-components/dashboard-components/StatCards";
import StatusCards from "../../../components/core-ui/official-components/dashboard-components/StatusCards";
import RecentReports from "../../../components/core-ui/official-components/dashboard-components/RecentReports";

export default function page() {
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row overflow-hidden">
      <div className="md:h-screen md:w-auto">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col bg-gray-50 min-h-screen overflow-hidden">
        {/* pass search handler to Topbar */}
        <Topbar onSearch={(value) => setSearchQuery(value)} />

        <main className="flex-1 px-4 sm:px-6 py-4 overflow-y-auto">
          <div className="mb-4">
            <h1 className="text-lg sm:text-xl font-semibold text-gray-800">
              Dashboard Overview
            </h1>
            <p className="text-sm text-gray-500">
              Real-time environmental monitoring statistics
            </p>
          </div>

          <div className="space-y-4">
            <StatCards />
            <StatusCards />

            {/* pass searchQuery to RecentReports */}
            <RecentReports
              selectedStatus={selectedStatus}
              onStatusChange={setSelectedStatus}
              searchQuery={searchQuery}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
