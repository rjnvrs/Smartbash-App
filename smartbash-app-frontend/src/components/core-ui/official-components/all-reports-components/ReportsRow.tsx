"use client";

import { Flame, Droplets } from "lucide-react";
import { TableRow, TableCell } from "@/components/ui/table";

export type Report = {
  id: number;
  category: "Fire" | "Flood";
  description: string;
  location: string;
  date: string;
  status: "Pending" | "In Progress" | "Completed";
  statusColor: string;
  images?: string[];
  residentName?: string;
  residentEmail?: string;
};

interface ReportRowProps {
  report: Report;
  showHistory?: boolean;
  onDispatch?: (id: number) => void;
  onDetails?: (report: Report) => void;
}

export default function ReportRow({
  report,
  showHistory = false,
  onDispatch,
  onDetails,
}: ReportRowProps) {
  const getCategoryIcon = () => {
    if (report.category === "Fire") return <Flame className="w-4 h-4 text-orange-600" />;
    return <Droplets className="w-4 h-4 text-blue-600" />;
  };

  const getCategoryStyles = () => {
    if (report.category === "Fire") return "bg-orange-50 text-orange-700 border-orange-200";
    return "bg-blue-50 text-blue-700 border-blue-200";
  };

  return (
    <TableRow className="hover:bg-gray-50 transition-colors">
      <TableCell>
        <div
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${getCategoryStyles()}`}
        >
          {getCategoryIcon()}
          <span className="text-sm font-medium">{report.category}</span>
        </div>
      </TableCell>

      <TableCell>{report.description}</TableCell>
      <TableCell>{report.location}</TableCell>
      <TableCell>{report.date}</TableCell>

      <TableCell>
        <span className={`px-2 py-1 text-xs rounded-full ${report.statusColor}`}>
          {report.status}
        </span>
      </TableCell>

      <TableCell>
        <div className="flex flex-col sm:flex-row gap-1 md:gap-2">
          {!showHistory && report.status !== "Completed" && (
            <button
              onClick={() => onDispatch?.(report.id)}
              className="bg-black text-white text-xs md:text-sm font-medium px-2 py-1 md:px-3 md:py-2 rounded-full hover:bg-gray-900 transition-all duration-200"
            >
              Dispatch
            </button>
          )}

          <button
            onClick={() => onDetails?.(report)}
            className="bg-gray-100 text-gray-800 text-xs md:text-sm font-medium px-2 py-1 md:px-3 md:py-2 rounded-full hover:bg-gray-200 transition-all duration-200 border border-gray-300"
          >
            Details
          </button>
        </div>
      </TableCell>
    </TableRow>
  );
}
