"use client";

import { useState } from "react";
import Sidebar from "../../../../components/core-ui/official-components/Sidebar";
import SearchBar from "../../../../components/ui/SearchBar";
import CategoryFilter from "../../../../components/core-ui/official-components/CategoryFilter";
import StatusFilter from "../../../../components/ui/StatusFilter";
import ReportsTable, {
  ReportStatus,
  ReportCategory,
} from "../../../../components/core-ui/official-components/all-reports-components/ReportsTable";
import Pagination from "../../../../components/ui/Pagination";
import { AlertTriangle, Filter, X, RotateCcw } from "lucide-react";
import { apiFetch } from "@/lib/api";

export default function AllReports() {
  const [status, setStatus] = useState<ReportStatus>("All Status");
  const [category, setCategory] = useState<ReportCategory>("All Categories");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const REPORT_STATUSES: ReportStatus[] = ["All Status", "Pending", "In Progress", "Completed"];
  const REPORT_CATEGORIES: ReportCategory[] = ["All Categories", "Fire", "Flood"];

  const hasActiveFilters =
    category !== "All Categories" || (!showHistory && status !== "All Status");

  const resetFilters = () => {
    setCategory("All Categories");
    setStatus("All Status");
  };

  const activeFilterCount = [
    category !== "All Categories",
    !showHistory && status !== "All Status",
  ].filter(Boolean).length;

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
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold">
              {showHistory ? "History" : "Reports"}
            </h1>
            <p className="text-sm text-gray-600">
              {showHistory
                ? "Viewing completed reports from the database"
                : "Manage and track all environmental incident reports"}
            </p>
          </div>

          <div className="flex gap-2">
            {!showHistory && (
              <button
                onClick={handleDispatchAll}
                className="bg-red-600 text-white px-4 py-2 rounded-full flex items-center gap-2 hover:bg-red-700 transition-colors"
              >
                <AlertTriangle className="w-4 h-4" />
                Dispatch All
              </button>
            )}

            <button
              onClick={() => {
                setShowHistory((prev) => !prev);
                setShowFilters(false);
                setStatus("All Status");
                setCurrentPage(1);
              }}
              className="border border-gray-300 px-4 py-2 rounded-full hover:bg-gray-50 transition-colors"
            >
              {showHistory ? "Back to Reports" : "View History"}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1">
            <SearchBar value={searchQuery} onSearch={setSearchQuery} />
          </div>

          <div className="relative flex-shrink-0">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`group relative flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                showFilters || hasActiveFilters
                  ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30 scale-105"
                  : "bg-white border-2 border-gray-200 text-gray-700 hover:border-red-300 hover:shadow-md"
              }`}
            >
              <Filter className={`w-5 h-5 transition-transform duration-200 ${showFilters ? "rotate-180" : ""}`} />
              <span className="text-sm font-semibold">Filter</span>
              {activeFilterCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg animate-pulse">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {showFilters && (
              <>
                <div className="fixed inset-0 z-10 " onClick={() => setShowFilters(false)} />
                <div className="absolute top-full right-0 mt-3 w-96 bg-white border border-gray-200 rounded-2xl shadow-2xl z-20 overflow-hidden">
                  <div className="bg-gradient-to-r from-red-50 to-orange-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-900">Filters</h3>
                    <button
                      onClick={() => setShowFilters(false)}
                      className="w-8 h-8 rounded-lg hover:bg-white/50 flex items-center justify-center transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>

                  <div className="p-6 space-y-6 max-h-[500px] overflow-y-auto">
                    <div className="space-y-3">
                      <label className="block text-sm font-bold text-gray-900">Category</label>
                      <CategoryFilter
                        selectedCategory={category}
                        onCategoryChange={setCategory}
                        options={REPORT_CATEGORIES}
                      />
                    </div>

                    {!showHistory && (
                      <>
                        <div className="border-t border-gray-100"></div>
                        <div className="space-y-3">
                          <label className="block text-sm font-bold text-gray-900">Status</label>
                          <StatusFilter
                            selectedStatus={status}
                            onStatusChange={setStatus}
                            options={REPORT_STATUSES}
                          />
                        </div>
                      </>
                    )}
                  </div>

                  {hasActiveFilters && (
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                      <button
                        onClick={resetFilters}
                        className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-red-600 transition-colors"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Reset All
                      </button>
                      <button
                        onClick={() => setShowFilters(false)}
                        className="bg-gradient-to-r from-red-500 to-red-600 text-white px-5 py-2 rounded-lg text-sm font-semibold"
                      >
                        Apply Filters
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        <ReportsTable
          selectedStatus={showHistory ? "Completed" : status}
          selectedCategory={category}
          searchQuery={searchQuery}
          hideCompleted={!showHistory}
          showHistory={showHistory}
          refreshKey={refreshKey}
        />

        <div className="mt-6">
          <Pagination currentPage={currentPage} totalPages={1} onPageChange={setCurrentPage} />
        </div>
      </div>
    </div>
  );
}
