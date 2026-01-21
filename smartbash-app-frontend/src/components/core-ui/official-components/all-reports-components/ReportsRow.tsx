"use client"

import { Flame, Waves } from 'lucide-react';
import Image from 'next/image';

export type Report = {
    id: number
    category: "Fire" | "Flood";
    description: string;
    location: string;
    date: string;
    status: "Pending" | "In Progress" | "Completed";
    statusColor: string; 
};

interface ReportRowProps {
    report: Report;
}

export default function ReportRow({ report }: ReportRowProps) {
  return (
    <tr className="hover:bg-gray-50 transition-colors">
      {/* Category Column */}
      <td className="px-3 py-3 md:px-4 lg:px-6 md:py-4">
        <div className="flex items-center">
          <div className="flex-shrink-0 w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center">
            {report.category === "Fire" && (
              <div className="w-5 h-5 md:w-6 md:h-6 bg-red-100 rounded-full flex items-center justify-center p-0.5 md:p-1">
                <Flame className="w-3 h-3 md:w-4 md:h-4 text-red-500" />
              </div>
            )}
            {report.category === "Flood" && (
              <div className="w-5 h-5 md:w-6 md:h-6 bg-blue-100 rounded-full flex items-center justify-center p-0.5 md:p-1">
                <Waves className="w-3 h-3 md:w-4 md:h-4 text-blue-500" />
              </div>
            )}
          </div>
          <div className="ml-2 md:ml-4">
            <div className="text-xs md:text-sm font-medium text-gray-900">{report.category}</div>
          </div>
        </div>
      </td>
      
      {/* Description Column */}
      <td className="px-3 py-3 md:px-4 lg:px-6 md:py-4">
        <div className="text-xs md:text-sm text-gray-900 line-clamp-2 max-w-[150px] md:max-w-xs">
          {report.description}
        </div>
      </td>
      
      {/* Location Column - hide on small screens */}
      <td className="hidden md:table-cell px-4 lg:px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{report.location}</div>
      </td>
      
      {/* Date Column */}
      <td className="px-3 py-3 md:px-4 lg:px-6 md:py-4 whitespace-nowrap">
        <div className="text-xs md:text-sm text-gray-900">
          <span className="md:hidden">{report.date.split(',')[0]}</span>
          <span className="hidden md:inline">{report.date}</span>
        </div>
      </td>
      
      {/* Status Column */}
      <td className="px-3 py-3 md:px-4 lg:px-6 md:py-4 whitespace-nowrap">
        <span className={`px-2 py-1 md:px-3 md:py-1 inline-flex text-xs leading-4 md:leading-5 font-semibold rounded-full ${report.statusColor}`}>
          {report.status}
        </span>
      </td>
      
      {/* Action Buttons Column */}
      <td className="px-3 py-3 md:px-4 lg:px-6 md:py-4 whitespace-nowrap">
        <div className="flex flex-col sm:flex-row gap-1 md:gap-2">
          <button className="bg-black text-white text-xs md:text-sm font-medium px-2 py-1 md:px-3 md:py-2 rounded-full hover:bg-gray-900 transition-all duration-200">
            Dispatch
          </button>
          <button className="bg-gray-100 text-gray-800 text-xs md:text-sm font-medium px-2 py-1 md:px-3 md:py-2 rounded-full hover:bg-gray-200 transition-all duration-200 border border-gray-300">
            Details
          </button>
        </div>
      </td>
    </tr>
  );
}