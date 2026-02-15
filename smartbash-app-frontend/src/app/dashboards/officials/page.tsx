"use client";

import { useEffect, useMemo, useState } from "react";
import Sidebar from "../../../components/core-ui/official-components/Sidebar";
import Topbar from "../../../components/core-ui/official-components/Topbar";
import StatCards from "../../../components/core-ui/official-components/dashboard-components/StatCards";
import StatusCards from "../../../components/core-ui/official-components/dashboard-components/StatusCards";
import RecentReports from "../../../components/core-ui/official-components/dashboard-components/RecentReports";
import { apiFetch } from "@/lib/api";

type ReportRow = {
  id: number;
  category: string;
  description: string;
  location: string;
  date: string;
  status: string;
  residentName?: string;
  residentEmail?: string;
  images?: string[];
};

export default function Page() {
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

  const [openStatsModal, setOpenStatsModal] = useState<null | "all" | "fire" | "flood">(null);
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");

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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load summary";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAllReports = async () => {
    setModalLoading(true);
    setModalError("");
    try {
      const res = await apiFetch("/auth/officials/reports/all/", { method: "GET" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load reports");
      setReports((data.reports || []) as ReportRow[]);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load reports";
      setModalError(message);
    } finally {
      setModalLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, []);

  useEffect(() => {
    if (openStatsModal) loadAllReports();
  }, [openStatsModal]);

  const modalTitle =
    openStatsModal === "all"
      ? "Total Reports"
      : openStatsModal === "fire"
        ? "Fire Reports"
        : "Flood Reports";

  const filteredModalReports = useMemo(() => {
    if (!openStatsModal) return [];
    if (openStatsModal === "all") return reports;
    return reports.filter((r) => r.category?.toLowerCase() === openStatsModal);
  }, [openStatsModal, reports]);

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row overflow-hidden">
      <div className="md:h-screen md:w-auto">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col bg-gray-50 min-h-screen overflow-hidden">
        <Topbar onSearch={(value) => setSearchQuery(value)} />

        <main className="flex-1 px-4 sm:px-6 py-4 overflow-y-auto">
          <div className="mb-4">
            <h1 className="text-lg sm:text-xl font-semibold text-gray-800">Dashboard Overview</h1>
            <p className="text-sm text-gray-500">Real-time environmental monitoring statistics</p>
          </div>

          <div className="space-y-4">
            {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-sm">{error}</div>}
            {isLoading && <div className="text-sm text-gray-500">Loading summary...</div>}
            <StatCards
              totalReports={summary.totalReports}
              fireReports={summary.fireReports}
              floodReports={summary.floodReports}
              onCardClick={setOpenStatsModal}
            />
            <StatusCards
              pendingReports={summary.pendingReports}
              inProgressReports={summary.inProgressReports}
              resolvedReports={summary.resolvedReports}
            />

            <RecentReports
              selectedStatus={selectedStatus}
              onStatusChange={setSelectedStatus}
              searchQuery={searchQuery}
            />
          </div>
        </main>
      </div>

      {openStatsModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl rounded-xl bg-white shadow-xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b p-4 sticky top-0 bg-white">
              <h3 className="text-lg font-semibold">{modalTitle} - Details</h3>
              <button
                onClick={() => setOpenStatsModal(null)}
                className="rounded px-2 py-1 text-sm hover:bg-gray-100"
              >
                Close
              </button>
            </div>

            <div className="p-4 text-sm">
              {modalError && <div className="mb-3 p-3 rounded bg-red-50 text-red-600">{modalError}</div>}
              {modalLoading ? (
                <div className="text-gray-500">Loading...</div>
              ) : filteredModalReports.length === 0 ? (
                <div className="text-gray-500">No reports found.</div>
              ) : (
                <div className="space-y-3">
                  {filteredModalReports.map((r) => (
                    <div key={r.id} className="border rounded-lg p-3">
                      <div className="font-semibold">{r.category}  -  {r.status}</div>
                      <div className="text-gray-600 mt-1">{r.description || "-"}</div>
                      <div className="text-gray-700 mt-1">Location: {r.location || "-"}</div>
                      <div className="text-gray-500 mt-1">{r.date ? new Date(r.date).toLocaleString() : ""}</div>
                      <div className="text-gray-600 mt-1">Resident: {r.residentName || "-"} ({r.residentEmail || "-"})</div>
                      {r.images && r.images.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                          {r.images.map((img, i) => (
                            <img key={`${r.id}-${i}`} src={img} alt={`report-${r.id}-${i}`} className="w-full h-28 object-cover rounded border" />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
