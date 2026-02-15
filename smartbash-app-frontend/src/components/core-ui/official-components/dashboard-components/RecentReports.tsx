"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Flame, MapPin, Waves } from "lucide-react";
import StatusFilter from "../../../ui/StatusFilter";
import { apiFetch } from "@/lib/api";

type ReportItem = {
  id: number;
  category: string;
  description: string;
  location: string;
  date: string;
  status: string;
  images?: string[];
  residentName?: string;
  residentEmail?: string;
};

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
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);

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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load reports";
      setError(message);
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
        const dateText = report.date ? new Date(report.date).toLocaleString() : "";
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

  const statusFiltered =
    selectedStatus === "All"
      ? decoratedReports
      : decoratedReports.filter((report) => report.status === selectedStatus);

  const filteredReports = statusFiltered.filter((report) => {
    const q = searchQuery.toLowerCase();
    return (
      report.category.toLowerCase().includes(q) ||
      report.location.toLowerCase().includes(q) ||
      report.date.toLowerCase().includes(q) ||
      report.status.toLowerCase().includes(q) ||
      report.description.toLowerCase().includes(q)
    );
  });

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Recent Reports</h2>

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

      <div className="grid grid-cols-5 px-6 py-3 text-sm text-gray-500 border-b">
        <div>Category</div>
        <div>Location</div>
        <div>Date & Time</div>
        <div>Status</div>
        <div>Action</div>
      </div>

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
          filteredReports.map((report) => (
            <div
              key={report.id}
              className="grid grid-cols-5 items-center px-6 py-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className={`flex items-center gap-2 font-medium ${report.color}`}>
                {report.icon}
                {report.category}
              </div>
              <div className="text-gray-700">{report.location}</div>
              <div className="text-gray-700">{report.date}</div>
              <div className={`${report.statusColor} font-medium`}>{report.status}</div>
              <div>
                <button
                  onClick={() => setSelectedReport(report)}
                  className="px-3 py-1 text-sm rounded-full border hover:bg-gray-100"
                >
                  View Details
                </button>
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

      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white shadow-xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b p-4">
              <h3 className="text-lg font-semibold">Report Details</h3>
              <button
                onClick={() => setSelectedReport(null)}
                className="rounded px-2 py-1 text-sm hover:bg-gray-100"
              >
                Close
              </button>
            </div>
            <div className="space-y-3 p-4 text-sm">
              <div><span className="font-semibold">Category:</span> {selectedReport.category}</div>
              <div><span className="font-semibold">Status:</span> {selectedReport.status}</div>
              <div><span className="font-semibold">Date:</span> {selectedReport.date}</div>
              <div><span className="font-semibold">Location:</span> {selectedReport.location}</div>
              <div><span className="font-semibold">Description:</span> {selectedReport.description || "-"}</div>
              <div><span className="font-semibold">Resident:</span> {selectedReport.residentName || "-"}</div>
              <div><span className="font-semibold">Resident Email:</span> {selectedReport.residentEmail || "-"}</div>

              {selectedReport.images && selectedReport.images.length > 0 && (
                <div>
                  <div className="font-semibold mb-2">Attached Images</div>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedReport.images.map((img, i) => (
                      <img key={`${img}-${i}`} src={img} alt={`report-${i}`} className="w-full h-40 object-cover rounded border" />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
