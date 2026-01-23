"use client";

import { useRouter } from "next/navigation";
import { Flame, MapPin, Waves } from "lucide-react";
import StatusFilter from "../../../ui/StatusFilter";

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

  const statusOptions = ["All", "Pending", "In Progress", "Completed"];

  const goToMap = () => {
    router.push("/dashboards/officials/incident-map");
  };

  const reports = [
    {
      category: "Fire",
      icon: <Flame className="h-5 w-5 text-red-500" />,
      color: "text-red-600",
      location: "Laguna, Brgy. Basak, Cebu City",
      date: "Dec 4, 10:26 AM",
      status: "In Progress",
      statusColor: "text-blue-600",
    },
    {
      category: "Flood",
      icon: <Waves className="h-5 w-5 text-blue-500" />,
      color: "text-blue-600",
      location: "Laguna, Brgy. Basak, Cebu City",
      date: "Dec 5, 10:26 AM",
      status: "Completed",
      statusColor: "text-green-600",
    },
    {
      category: "Fire",
      icon: <Flame className="h-5 w-5 text-red-500" />,
      color: "text-red-600",
      location: "Laguna, Brgy. Basak, Cebu City",
      date: "Dec 5, 10:26 AM",
      status: "Pending",
      statusColor: "text-orange-600",
    },
  ];

  // Status Filter
  const statusFiltered =
    selectedStatus === "All"
      ? reports
      : reports.filter((report) => report.status === selectedStatus);

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
        {filteredReports.length > 0 ? (
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
