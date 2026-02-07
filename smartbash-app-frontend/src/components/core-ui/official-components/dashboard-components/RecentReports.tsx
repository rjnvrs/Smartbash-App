"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Flame, MapPin, Waves } from "lucide-react";
import StatusFilter from "../../../ui/StatusFilter";
import { apiFetch } from "@/lib/api";

type RecentReportsProps = {
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  searchQuery: string;
};

export default function RecentReports({
  selectedStatus,
  onStatusChange,
  searchQuery,
}: RecentReportsProps) {
  const router = useRouter();
  const [reports, setReports] = useState<
    {
      id: number;
      category: string;
      location: string;
      date: string;
      status: string;
    }[]
  >([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const statusOptions = ["All", "Pending", "In Progress", "Completed"];

  const goToMap = () => {
    router.push("/dashboards/officials/incident-map");
  };

  const loadReports = async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await apiFetch("/auth/officials/reports/recent/", {
        method: "GET",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load reports");
      setReports(data.reports || []);
    } catch (err: any) {
      setError(err.message || "Failed to load reports");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const decoratedReports = useMemo(
    () =>
      reports.map((report) => {
        const isFire = report.category.toLowerCase() === "fire";
        const icon = isFire ? (
          <Flame className="h-5 w-5 text-red-500" />
        ) : (
          <Waves className="h-5 w-5 text-blue-500" />
        );
        const color = isFire ? "text-red-600" : "text-blue-600";
        const statusColor =
          report.status === "Pending"
            ? "text-orange-600"
            : report.status === "In Progress"
            ? "text-blue-600"
            : "text-green-600";
        const dateText = report.date
          ? new Date(report.date).toLocaleString()
          : "";
        return {
          ...report,
          icon,
          color,
          statusColor,
          date: dateText,
        };
      }),
    [reports]
  );

  // Status Filter
  const statusFiltered =
    selectedStatus === "All"
      ? decoratedReports
      : decoratedReports.filter((report) => report.status === selectedStatus);

  // Search Filter
  const filteredReports = statusFiltered.filter((report) => {
    const q = searchQuery.toLowerCase();
    return (
      report.category.toLowerCase().includes(q) ||
      report.location.toLowerCase().includes(q) ||
      report.date.toLowerCase().includes(q) ||
      report.status.toLowerCase().includes(q)
    );
  });

  return (
    <div className="mt-8">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Recent Reports</h2>

        {/* FILTER + MAP */}
        <div className="flex items-center gap-3">
          <StatusFilter
            selectedStatus={selectedStatus}
            onStatusChange={onStatusChange}
            options={statusOptions}
          />

          <button
            onClick={goToMap}
            className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition border"
            aria-label="View incident map"
          >
            <MapPin className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* TABLE HEADER */}
      <div className="grid grid-cols-4 px-6 py-3 text-sm text-gray-500 border-b">
        <div>Category</div>
        <div>Location</div>
        <div>Date & Time</div>
        <div>Status</div>
      </div>

      {/* ROWS */}
      <div className="space-y-4 mt-2">
        {error && (
          <div className="px-6 py-4 text-sm text-red-600 bg-red-50 rounded-xl">
            {error}
          </div>
        )}
        {isLoading && (
          <div className="px-6 py-4 text-sm text-gray-500 bg-white rounded-xl">
            Loading reports...
          </div>
        )}
        {!isLoading && filteredReports.length > 0 ? (
          filteredReports.map((report, index) => (
            <div
              key={index}
              className="grid grid-cols-4 items-center px-6 py-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className={`flex items-center gap-2 font-medium ${report.color}`}>
                {report.icon}
                {report.category}
              </div>
              <div className="text-gray-700">{report.location}</div>
              <div className="text-gray-700">{report.date}</div>
              <div className={`${report.statusColor} font-medium`}>
                {report.status}
              </div>
            </div>
          ))
        ) : (
          <div className="px-6 py-8 text-center text-gray-500 bg-white rounded-xl">
            No reports found for the selected status.
          </div>
        )}
      </div>

      <div className="mt-4 text-sm text-gray-500">
        Showing {filteredReports.length} report
        {filteredReports.length !== 1 ? "s" : ""}
        {selectedStatus !== "All" && ` (${selectedStatus})`}
      </div>
    </div>
  );
}
