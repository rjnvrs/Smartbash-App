"use client";

import { useEffect, useState } from "react";
import Sidebar from "../../../components/core-ui/official-components/Sidebar";
import Topbar from "../../../components/core-ui/official-components/Topbar";
import StatCards from "../../../components/core-ui/official-components/dashboard-components/StatCards";
import StatusCards from "../../../components/core-ui/official-components/dashboard-components/StatusCards";
import RecentReports from "../../../components/core-ui/official-components/dashboard-components/RecentReports";
import { apiFetch } from "@/lib/api";

export default function page() {
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [summary, setSummary] = useState({
    totalReports: 0,
    fireReports: 0,
    floodReports: 0,
    pendingReports: 0,
    inProgressReports: 0,
    resolvedReports: 0,
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const loadSummary = async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await apiFetch("/auth/officials/dashboard/", { method: "GET" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load summary");
      setSummary({
        totalReports: data.totalReports || 0,
        fireReports: data.fireReports || 0,
        floodReports: data.floodReports || 0,
        pendingReports: data.pendingReports || 0,
        inProgressReports: data.inProgressReports || 0,
        resolvedReports: data.resolvedReports || 0,
      });
    } catch (err: any) {
      setError(err.message || "Failed to load summary");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, []);

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
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-sm">
                {error}
              </div>
            )}
            {isLoading && (
              <div className="text-sm text-gray-500">Loading summary...</div>
            )}
            <StatCards
              totalReports={summary.totalReports}
              fireReports={summary.fireReports}
              floodReports={summary.floodReports}
            />
            <StatusCards
              pendingReports={summary.pendingReports}
              inProgressReports={summary.inProgressReports}
              resolvedReports={summary.resolvedReports}
            />

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
