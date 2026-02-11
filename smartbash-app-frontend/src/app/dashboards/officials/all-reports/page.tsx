"use client";

import { useState } from "react";
import Sidebar from "../../../../components/core-ui/official-components/Sidebar";
import SearchBar from "../../../../components/ui/SearchBar";
import CategoryFilter from "../../../../components/core-ui/official-components/CategoryFilter";
import StatusFilter from "../../../../components/ui/StatusFilter";
import ReportsTable from "../../../../components/core-ui/official-components/all-reports-components/ReportsTable";
import Pagination from "../../../../components/ui/Pagination";
import { ReportCategory } from "../../../../components/core-ui/official-components/all-reports-components/ReportsTable";
import { ReportStatus } from "../../../../components/core-ui/official-components/all-reports-components/ReportsTable";
import { AlertTriangle, Filter, X } from "lucide-react";
import { apiFetch } from "@/lib/api";

export default function AllReports() {
  const [status, setStatus] = useState<ReportStatus>("All Status");
  const [category, setCategory] = useState<ReportCategory>("All Categories");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const REPORT_STATUSES: ReportStatus[] = ["All Status", "Pending", "In Progress", "Completed"];
  const REPORT_CATEGORIES: ReportCategory[] = ["All Categories", "Fire", "Flood"];

  const handleClearFilters = () => {
    setStatus("All Status");
    setCategory("All Categories");
  };

  const hasActiveFilters = status !== "All Status" || category !== "All Categories";

  const handleDispatchAll = async () => {
    try {
      const res = await apiFetch("/auth/officials/reports/dispatch-all/", {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to dispatch all");
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to dispatch all";
      window.alert(message);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 p-4 md:p-6 overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 md:mb-6 gap-2">
          <div className="text-center sm:text-left">
            <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">Reports</h1>
            <p className="text-sm md:text-base text-gray-600">
              Manage and track all environmental incident reports
            </p>
          </div>

          <button
            onClick={handleDispatchAll}
            className="bg-red-600 text-white font-medium px-4 py-2 md:px-5 md:py-2.5 rounded-full hover:bg-red-700 transition-colors flex items-center gap-2 whitespace-nowrap text-sm md:text-base sm:mr-5"
          >
            <AlertTriangle className="w-4 h-4 md:w-5 md:h-5 text-yellow-500" />
            Dispatch All
          </button>
        </div>

        {/* Search + Filter */}
        <div className="flex items-center gap-3 mb-4 md:mb-6">
          <div className="flex-1 lg:w-1/2">
            <SearchBar value={searchQuery} onSearch={setSearchQuery} />
          </div>

          <div className="relative flex-shrink-0">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border shadow-sm transition-all ${
                showFilters || hasActiveFilters
                  ? "bg-red-50 border-red-500 text-red-600"
                  : "bg-white border-gray-200 text-gray-700"
              }`}
            >
              <Filter className="w-5 h-5" />
              <span className="text-sm font-medium">Filter</span>

              {hasActiveFilters && (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-red-500 text-white rounded-full min-w-[20px] flex items-center justify-center">
                  2
                </span>
              )}
            </button>

            {/* Filter Panel */}
            {showFilters && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowFilters(false)} />
                <div className="absolute top-full right-0 mt-3 w-80 bg-white border border-gray-200 rounded-2xl shadow-2xl z-20 overflow-hidden">
                  {/* Panel header */}
                  <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-red-50 to-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-red-600" />
                        <h3 className="text-base font-semibold text-gray-900">Filters</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        {hasActiveFilters && (
                          <button
                            onClick={handleClearFilters}
                            className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
                          >
                            Clear All
                          </button>
                        )}
                        <button onClick={() => setShowFilters(false)} className="ml-2 text-gray-500 hover:text-gray-700">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Panel content */}
                  <div className="p-5 space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-3">Category</label>
                      <CategoryFilter selectedCategory={category} onCategoryChange={setCategory} options={REPORT_CATEGORIES} />
                    </div>

                    <div className="border-t border-gray-100"></div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-3">Status</label>
                      <StatusFilter selectedStatus={status} onStatusChange={setStatus} options={REPORT_STATUSES} />
                    </div>

                    {hasActiveFilters && (
                      <div className="pt-4 border-t border-gray-100">
                        <p className="text-sm text-gray-600 mb-2">Active filters:</p>
                        <div className="flex flex-wrap gap-2">
                          {status !== "All Status" && (
                            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full flex items-center gap-1">
                              Status: {status}
                              <button onClick={() => setStatus("All Status")} className="ml-1 hover:text-red-900">
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          )}
                          {category !== "All Categories" && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full flex items-center gap-1">
                              Category: {category}
                              <button onClick={() => setCategory("All Categories")} className="ml-1 hover:text-blue-900">
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="px-5 py-4 bg-gray-50 border-t border-gray-100">
                    <button onClick={() => setShowFilters(false)} className="w-full h-10 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors">
                      Apply Filters
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Active filters */}
        {hasActiveFilters && (
          <div className="mb-4 p-3 bg-gradient-to-r from-red-50 to-white border border-red-100 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Filters applied:</span>
                <div className="flex flex-wrap gap-2">
                  {status !== "All Status" && (
                    <span className="px-3 py-1 bg-white border border-red-200 text-red-700 text-sm rounded-full flex items-center gap-1">
                      Status: {status}
                      <button onClick={() => setStatus("All Status")} className="ml-1 hover:text-red-900">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {category !== "All Categories" && (
                    <span className="px-3 py-1 bg-white border border-blue-200 text-blue-700 text-sm rounded-full flex items-center gap-1">
                      Category: {category}
                      <button onClick={() => setCategory("All Categories")} className="ml-1 hover:text-blue-900">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                </div>
              </div>
              <button onClick={handleClearFilters} className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors">
                Clear All
              </button>
            </div>
          </div>
        )}

        {/* Reports Table */}
        <div className="overflow-x-auto">
          <ReportsTable selectedStatus={status} selectedCategory={category} searchQuery={searchQuery} refreshKey={refreshKey} />
        </div>

        {/* Pagination */}
        <div className="mt-4 md:mt-6">
          <Pagination />
        </div>
      </div>
    </div>
  );
}
