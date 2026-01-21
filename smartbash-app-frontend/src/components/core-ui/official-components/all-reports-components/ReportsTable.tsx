"use client"

import ReportRow, { Report } from "./ReportsRow";

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
  // Filter reports based on status, category, and search query
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
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date & Time
              </th>
              <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredReports.length > 0 ? (
              filteredReports.map((report) => (
                <ReportRow key={report.id} report={report} />
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-4 text-gray-500">
                  No reports found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden">
        <div className="p-3 space-y-4">
          {filteredReports.length > 0 ? (
            filteredReports.map((report) => (
              <div key={report.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
                {/* Card content same as before */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center">
                      {report.category === "Fire" && (
                        <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center p-1">
                          <img 
                            src="/RecentReport_icons/Fire_icons.png" 
                            alt="Fire" 
                            className="w-4 h-4 object-contain"
                          />
                        </div>
                      )}
                      {report.category === "Flood" && (
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center p-1">
                          <img 
                            src="/RecentReport_icons/Flood_icons.png" 
                            alt="Flood" 
                            className="w-4 h-4 object-contain"
                          />
                        </div>
                      )}
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">{report.category}</div>
                    </div>
                  </div>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${report.statusColor}`}>
                    {report.status}
                  </span>
                </div>

                <div className="text-sm text-gray-900 line-clamp-2">{report.description}</div>

                <div className="text-xs text-gray-600 space-y-1">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {report.location}
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {report.date}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button className="flex-1 bg-black text-white text-sm font-medium py-2 rounded-full hover:bg-gray-900 transition-colors">
                    Dispatch
                  </button>
                  <button className="flex-1 bg-gray-100 text-gray-800 text-sm font-medium py-2 rounded-full hover:bg-gray-200 transition-colors border border-gray-300">
                    Details
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-gray-500">No reports found</div>
          )}
        </div>
      </div>
    </div>
  );
}
