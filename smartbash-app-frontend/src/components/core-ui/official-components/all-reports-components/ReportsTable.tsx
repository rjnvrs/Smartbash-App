
"use client";


import ReportRow, { Report } from "./ReportsRow";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
} from "@/components/ui/table";
import { Flame, Droplets, MapPin, Calendar, Clock } from "lucide-react";


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
  hideCompleted?: boolean;
  showHistory?: boolean;
}


export default function ReportsTable({
  selectedStatus,
  selectedCategory,
  searchQuery,
  hideCompleted = false,
  showHistory = false,
}: ReportsTableProps) {


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


    const hideCompletedMatch = hideCompleted ? report.status !== "Completed" : true;


    return statusMatch && categoryMatch && searchMatch && hideCompletedMatch;
  });


  const getCategoryIcon = (category: "Fire" | "Flood") => {
    if (category === "Fire") {
      return <Flame className="w-4 h-4 text-orange-600" />;
    }
    return <Droplets className="w-4 h-4 text-blue-600" />;
  };


  const getCategoryStyles = (category: "Fire" | "Flood") => {
    if (category === "Fire") {
      return "bg-orange-50 text-orange-700 border-orange-200";
    }
    return "bg-blue-50 text-blue-700 border-blue-200";
  };


  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Mobile Card View */}
      <div className="block md:hidden">
        <div className="divide-y divide-gray-200">
          {filteredReports.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No reports found
            </div>
          ) : (
            filteredReports.map((report) => (
              <div key={report.id} className="p-4 hover:bg-gray-50 transition-colors">
                {/* Category Badge */}
                <div className="flex items-center justify-between mb-3">
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${getCategoryStyles(report.category)}`}>
                    {getCategoryIcon(report.category)}
                    <span className="text-sm font-semibold">{report.category}</span>
                  </div>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${report.statusColor}`}>
                    {report.status}
                  </span>
                </div>


                {/* Description */}
                <p className="text-sm text-gray-900 mb-3 line-clamp-2">
                  {report.description}
                </p>


                {/* Location & Date */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-start gap-2 text-xs text-gray-600">
                    <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{report.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Clock className="w-4 h-4 flex-shrink-0" />
                    <span>{report.date}</span>
                  </div>
                </div>


                {/* Action Buttons */}
                <div className="flex gap-2">
                  {!showHistory && (
                    <button className="flex-1 bg-black text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-gray-900 transition-all duration-200">
                      Dispatch
                    </button>
                  )}
                  <button className="flex-1 bg-gray-100 text-gray-800 text-sm font-medium px-4 py-2 rounded-full hover:bg-gray-200 transition-all duration-200 border border-gray-300">
                    Details
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>


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
            {filteredReports.length === 0 ? (
              <TableRow>
                <td colSpan={6} className="text-center py-8 text-gray-500">
                  No reports found
                </td>
              </TableRow>
            ) : (
              filteredReports.map((report) => (
                <ReportRow
                  key={report.id}
                  report={report}
                  showHistory={showHistory}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
