"use client";

import { useState } from "react";
import Sidebar from "../../../../components/core-ui/official-components/Sidebar";
import SearchBar from "../../../../components/core-ui/official-components/SearchBar";
import CategoryFilter from "../../../../components/core-ui/official-components/CategoryFilter";
import StatusFilter from "../../../../components/core-ui/official-components/StatusFilter";
import ReportsTable from "../../../../components/core-ui/official-components/all-reports-components/ReportsTable";
import Pagination from "../../../../components/core-ui/official-components/Pagination";
import { ReportCategory } from "../../../../components/core-ui/official-components/all-reports-components/ReportsTable";
import { ReportStatus } from "../../../../components/core-ui/official-components/all-reports-components/ReportsTable";
import { AlertTriangle, Bookmark } from "lucide-react";

export default function AllReports() {
  // State for filters
  const [status, setStatus] = useState<ReportStatus>("All Status");
  const [category, setCategory] = useState<ReportCategory>("All Categories");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Options for filters
  const REPORT_STATUSES: ReportStatus[] = ["All Status", "Pending", "In Progress", "Completed"];
  const REPORT_CATEGORIES: ReportCategory[] = ["All Categories", "Fire", "Flood"];

  const handleClearFilters = () => {
    setStatus("All Status");
    setCategory("All Categories");
  };

  const hasActiveFilters = status !== "All Status" || category !== "All Categories";

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 p-4 md:p-6 overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 md:mb-6 gap-2">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">Reports</h1>
            <p className="text-sm md:text-base text-gray-600">
              Manage and track all environmental incident reports
            </p>
          </div>

          <button className="bg-red-600 text-white font-medium px-4 py-2 md:px-5 md:py-2.5 rounded-full hover:bg-red-700 transition-colors flex items-center gap-2 whitespace-nowrap text-sm md:text-base mr-5">
            <AlertTriangle className="w-4 h-4 md:w-5 md:h-5 text-yellow-500" />
            Dispatch All
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-3 mb-4 md:mb-6">
          <div className="w-full lg:w-1/2">
            <SearchBar onSearch={setSearchQuery} />
          </div>

          <div className="relative">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`w-11 h-11 rounded-xl border shadow-sm flex items-center justify-center transition-all ${
                showFilters || hasActiveFilters
                  ? "bg-red-50 border-red-500 text-red-600"
                  : "bg-white border-gray-200"
              }`}
            >
              <Bookmark className="w-5 h-5 text-gray-700 hover:text-gray-900 transition-colors" />

              {hasActiveFilters && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
              )}
            </button>

            {/* DROPDOWN FILTER PANEL */}
            {showFilters && (
              <>
                <div 
                  className="fixed inset-0 z-10"
                  onClick={() => setShowFilters(false)}
                />
                
                <div className="absolute top-full right-0 mt-3 w-80 bg-white border border-gray-200 rounded-2xl shadow-2xl z-20 overflow-hidden">
                  {/* Header */}
                  <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-red-50 to-white">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-semibold text-gray-900">Filters</h3>
                      {hasActiveFilters && (
                        <button
                          onClick={handleClearFilters}
                          className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
                        >
                          Clear All
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Filter Content */}
                  <div className="p-5 space-y-5">
                    {/* Category Filter */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-3">
                        Category
                      </label>
                      <CategoryFilter
                        selectedCategory={category}
                        onCategoryChange={setCategory}
                        options={REPORT_CATEGORIES}
                      />
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-100"></div>

                    {/* Status Filter */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-3">
                        Status
                      </label>
                      <StatusFilter
                        selectedStatus={status}
                        onStatusChange={setStatus}
                        options={REPORT_STATUSES}
                      />
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="px-5 py-4 bg-gray-50 border-t border-gray-100">
                    <button
                      onClick={() => setShowFilters(false)}
                      className="w-full h-10 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
                    >
                      Apply Filters
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Reports Table */}
        <div className="overflow-x-auto">
          <ReportsTable
            selectedStatus={status}
            selectedCategory={category}
            searchQuery={searchQuery}
          />
        </div>

        {/* Pagination */}
        <div className="mt-4 md:mt-6">
          <Pagination />
        </div>
      </div>
    </div>
  );
}