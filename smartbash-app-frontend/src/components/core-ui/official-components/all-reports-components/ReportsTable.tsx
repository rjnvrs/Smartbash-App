"use client";

import ReportRow, { Report } from "./ReportsRow";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

export type ReportStatus = "All Status" | "Pending" | "In Progress" | "Completed";
export type ReportCategory = "All Categories" | "Fire" | "Flood";

const reportsData: Report[] = [
  {
    id: 1,
    category: "Fire",
    description: "Na sunog ngn naktta sa likad sa residentia area. Nag sugad ang kataya sa basura nga gisunag",
    location: "Laguna, Bray. Basak, Cebu City",
    date: "Dec 4, 10:26 AM",
    status: "In Progress",
    statusColor: "bg-yellow-100 text-yellow-800"
  },
  {
    id: 2,
    category: "Flood",
    description: "Nay baha dri taas kaaya ang tubig",
    location: "Pardo, Bray. Basak, Cebu City",
    date: "Dec 4, 10:26 AM",
    status: "Completed",
    statusColor: "bg-green-100 text-green-800"
  },
  {
    id: 3,
    category: "Flood",
    description: "Nay daghang basura diri baho na kaaya",
    location: "Pardo, Bray. Basak, Cebu City",
    date: "Dec 4, 10:26 AM",
    status: "Pending",
    statusColor: "bg-red-100 text-red-800"
  }
];

interface ReportsTableProps {
  selectedStatus: "All Status" | Report["status"];
  selectedCategory: "All Categories" | Report["category"];
  searchQuery: string;
}

export default function ReportsTable({ selectedStatus, selectedCategory, searchQuery }: ReportsTableProps) {
  const filteredReports = reportsData.filter((report) => {
    const statusMatch =
      selectedStatus === "All Status" || report.status === selectedStatus;

    const categoryMatch =
      selectedCategory === "All Categories" || report.category === selectedCategory;

    const searchMatch =
      !searchQuery ||
      report.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.category.toLowerCase().includes(searchQuery.toLowerCase());

    return statusMatch && categoryMatch && searchMatch;
  });

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Desktop Table View */}
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
            {filteredReports.length > 0 ? (
              filteredReports.map((report) => (
                <ReportRow key={report.id} report={report} />
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

      {/* Mobile Card View */}
      <div className="md:hidden p-3 space-y-3">
        {filteredReports.length > 0 ? (
          filteredReports.map((report) => (
            <div key={report.id} className="bg-white border rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
                    {report.category === "Fire" ? (
                      <span className="text-red-600 font-bold">🔥</span>
                    ) : (
                      <span className="text-blue-600 font-bold">🌊</span>
                    )}
                  </div>
                  <div className="font-medium">{report.category}</div>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${report.statusColor}`}>
                  {report.status}
                </span>
              </div>

              <div className="text-sm text-gray-800 line-clamp-2 mb-2">
                {report.description}
              </div>

              <div className="text-xs text-gray-500 mb-2">
                {report.location}
              </div>

              <div className="flex justify-between items-center">
                <div className="text-xs text-gray-500">{report.date}</div>
                <div className="flex gap-2">
                  <button className="bg-black text-white text-xs font-medium px-3 py-1 rounded-full">
                    Dispatch
                  </button>
                  <button className="bg-gray-100 text-gray-800 text-xs font-medium px-3 py-1 rounded-full border">
                    Details
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500">No reports found</div>
        )}
      </div>
    </div>
  );
}
