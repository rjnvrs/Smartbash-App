"use client"

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
      <div className="md:hidden">
        {/* ... (same as your original mobile code) */}
      </div>
    </div>
  );
}
