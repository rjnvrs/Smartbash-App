"use client";

import { useEffect, useMemo, useState } from "react";
import ReportRow, { Report } from "./ReportsRow";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { apiFetch } from "@/lib/api";

export type ReportStatus = "All Status" | "Pending" | "In Progress" | "Completed";
export type ReportCategory = "All Categories" | "Fire" | "Flood";

interface ReportsTableProps {
  selectedStatus: "All Status" | Report["status"];
  selectedCategory: "All Categories" | Report["category"];
  searchQuery: string;
  hideCompleted?: boolean;
  showHistory?: boolean;
  refreshKey?: number;
}

export default function ReportsTable({
  selectedStatus,
  selectedCategory,
  searchQuery,
  hideCompleted = false,
  showHistory = false,
  refreshKey = 0,
}: ReportsTableProps) {
  const [reports, setReports] = useState<Report[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const loadReports = async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await apiFetch("/auth/officials/reports/all/", { method: "GET" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load reports");

      const normalized: Report[] = (data.reports || []).map(
        (r: {
          id: number;
          category: string;
          description: string;
          location: string;
          date: string;
          status: Report["status"];
          images?: string[];
          residentName?: string;
          residentEmail?: string;
        }) => {
          const isFire = (r.category || "").toLowerCase() === "fire";
          const statusColor =
            r.status === "Pending"
              ? "bg-red-100 text-red-800"
              : r.status === "In Progress"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-green-100 text-green-800";
          return {
            id: r.id,
            category: isFire ? "Fire" : "Flood",
            description: r.description || "",
            location: r.location || "",
            date: r.date ? new Date(r.date).toLocaleString() : "",
            status: r.status,
            statusColor,
            images: r.images || [],
            residentName: r.residentName || "",
            residentEmail: r.residentEmail || "",
          };
        }
      );

      setReports(normalized);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load reports";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [refreshKey]);

  const handleDispatch = async (id: number) => {
    try {
      const res = await apiFetch("/auth/officials/reports/dispatch/", {
        method: "POST",
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to dispatch");
      await loadReports();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to dispatch";
      setError(message);
    }
  };

  const filteredReports = useMemo(
    () =>
      reports.filter((report) => {
        const statusMatch = selectedStatus === "All Status" || report.status === selectedStatus;
        const categoryMatch =
          selectedCategory === "All Categories" || report.category === selectedCategory;
        const searchMatch =
          !searchQuery ||
          report.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          report.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
          report.category.toLowerCase().includes(searchQuery.toLowerCase());

        if (showHistory) {
          return statusMatch && categoryMatch && searchMatch && report.status === "Completed";
        }

        const hideCompletedMatch = hideCompleted ? report.status !== "Completed" : true;
        return statusMatch && categoryMatch && searchMatch && hideCompletedMatch;
      }),
    [reports, selectedStatus, selectedCategory, searchQuery, hideCompleted, showHistory]
  );

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="hidden md:block overflow-x-auto">
        <Table className="min-w-full divide-y divide-gray-200">
          <TableHeader>
            <tr>
              <TableHead>Category</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </tr>
          </TableHeader>

          <TableBody>
            {error && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4 text-red-600">
                  {error}
                </TableCell>
              </TableRow>
            )}
            {isLoading && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                  Loading reports...
                </TableCell>
              </TableRow>
            )}
            {!isLoading && !error && filteredReports.length > 0 ? (
              filteredReports.map((report) => (
                <ReportRow
                  key={report.id}
                  report={report}
                  showHistory={showHistory}
                  onDispatch={handleDispatch}
                  onDetails={setSelectedReport}
                />
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                  No reports found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="md:hidden p-3 space-y-3">
        {filteredReports.length > 0 ? (
          filteredReports.map((report) => (
            <div key={report.id} className="bg-white border rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium">{report.category}</div>
                <span className={`px-2 py-1 text-xs rounded-full ${report.statusColor}`}>
                  {report.status}
                </span>
              </div>
              <div className="text-sm text-gray-800 line-clamp-2 mb-2">{report.description}</div>
              <div className="text-xs text-gray-500 mb-2">{report.location}</div>
              <div className="flex justify-between items-center">
                <div className="text-xs text-gray-500">{report.date}</div>
                <div className="flex gap-2">
                  {!showHistory && report.status !== "Completed" && (
                    <button
                      onClick={() => handleDispatch(report.id)}
                      className="bg-black text-white text-xs font-medium px-3 py-1 rounded-full"
                    >
                      Dispatch
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedReport(report)}
                    className="bg-gray-100 text-gray-800 text-xs font-medium px-3 py-1 rounded-full border"
                  >
                    Details
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 py-4">No reports found</div>
        )}
      </div>

      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white shadow-xl">
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
              <div>
                <span className="font-semibold">Category:</span> {selectedReport.category}
              </div>
              <div>
                <span className="font-semibold">Status:</span> {selectedReport.status}
              </div>
              <div>
                <span className="font-semibold">Date:</span> {selectedReport.date}
              </div>
              <div>
                <span className="font-semibold">Location:</span> {selectedReport.location}
              </div>
              <div>
                <span className="font-semibold">Resident:</span> {selectedReport.residentName || "-"} (
                {selectedReport.residentEmail || "-"})
              </div>
              <div>
                <span className="font-semibold">Description:</span>
                <p className="mt-1 whitespace-pre-wrap">{selectedReport.description || "-"}</p>
              </div>
              <div>
                <span className="font-semibold">Attached Images:</span>
                {selectedReport.images && selectedReport.images.length > 0 ? (
                  <div className="mt-2 grid grid-cols-2 gap-3">
                    {selectedReport.images.map((img, idx) => (
                      <img
                        key={`${selectedReport.id}-${idx}`}
                        src={img}
                        alt={`report-${selectedReport.id}-${idx}`}
                        className="h-40 w-full rounded border object-cover"
                      />
                    ))}
                  </div>
                ) : (
                  <p className="mt-1 text-gray-500">No attached images.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
