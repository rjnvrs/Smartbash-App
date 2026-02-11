"use client";


import { useState } from "react";
import Sidebar from "../../../../components/core-ui/official-components/Sidebar";
import SearchBar from "../../../../components/ui/SearchBar";
import CategoryFilter from "../../../../components/core-ui/official-components/CategoryFilter";
import StatusFilter from "../../../../components/ui/StatusFilter";
import ReportsTable from "../../../../components/core-ui/official-components/all-reports-components/ReportsTable";
import Pagination from "../../../../components/ui/Pagination";
import { AlertTriangle, Filter, X, RotateCcw } from "lucide-react";
import {
  ReportStatus,
  ReportCategory,
} from "../../../../components/core-ui/official-components/all-reports-components/ReportsTable";


export default function AllReports() {
  const [status, setStatus] = useState<ReportStatus>("All Status");
  const [category, setCategory] = useState<ReportCategory>("All Categories");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showHistory, setShowHistory] = useState(false);


  const REPORT_STATUSES: ReportStatus[] = [
    "All Status",
    "Pending",
    "In Progress",
    "Completed",
  ];


  const REPORT_CATEGORIES: ReportCategory[] = [
    "All Categories",
    "Fire",
    "Flood",
  ];


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


  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />


      <div className="flex-1 p-4 md:p-6 overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold">
              {showHistory ? "History" : "Reports"}
            </h1>
            <p className="text-sm text-gray-600">
              {showHistory
                ? "Viewing completed reports"
                : "Manage and track all environmental incident reports"}
            </p>
          </div>


          <div className="flex gap-2">
            {!showHistory && (
              <button className="bg-red-600 text-white px-4 py-2 rounded-full flex items-center gap-2 hover:bg-red-700 transition-colors">
                <AlertTriangle className="w-4 h-4" />
                Dispatch All
              </button>
            )}


            <button
              onClick={() => {
                setShowHistory(!showHistory);
                setShowFilters(false);
              }}
              className="border border-gray-300 px-4 py-2 rounded-full hover:bg-gray-50 transition-colors"
            >
              {showHistory ? "Back to Reports" : "View History"}
            </button>
          </div>
        </div>


        {/* Search + Filter */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1">
            <SearchBar value={searchQuery} onSearch={setSearchQuery} />
          </div>


          {/* Enhanced Filter Button */}
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`group relative flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                showFilters || hasActiveFilters
                  ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30 scale-105"
                  : "bg-white border-2 border-gray-200 text-gray-700 hover:border-red-300 hover:shadow-md"
              }`}
            >
              <Filter
                className={`w-5 h-5 transition-transform duration-200 ${
                  showFilters ? "rotate-180" : ""
                }`}
              />
              <span className="text-sm font-semibold">Filter</span>
              {activeFilterCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg animate-pulse">
                  {activeFilterCount}
                </span>
              )}
            </button>


            {/* Enhanced Filter Dropdown */}
            {showFilters && (
              <>
                <div
                  className="fixed inset-0 z-10 "
                  onClick={() => setShowFilters(false)}
                />
                <div className="absolute top-full right-0 mt-3 w-96 bg-white border border-gray-200 rounded-2xl shadow-2xl z-20 overflow-hidden animate-in slide-in-from-top-2 duration-300">
                  {/* Filter Header */}
                  <div className="bg-gradient-to-r from-red-50 to-orange-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                        <Filter className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          Filters
                        </h3>
                        <p className="text-xs text-gray-600">
                          Refine your search results
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowFilters(false)}
                      className="w-8 h-8 rounded-lg hover:bg-white/50 flex items-center justify-center transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>


                  {/* Filter Content */}
                  <div className="p-6 space-y-6 max-h-[500px] overflow-y-auto">
                    {/* Category Filter */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="block text-sm font-bold text-gray-900">
                          Category
                        </label>
                        {category !== "All Categories" && (
                          <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full font-medium">
                            Active
                          </span>
                        )}
                      </div>
                      <CategoryFilter
                        selectedCategory={category}
                        onCategoryChange={setCategory}
                        options={REPORT_CATEGORIES}
                      />
                    </div>


                    {/* Status Filter (only in Reports view) */}
                    {!showHistory && (
                      <>
                        <div className="border-t border-gray-100"></div>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="block text-sm font-bold text-gray-900">
                              Status
                            </label>
                            {status !== "All Status" && (
                              <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full font-medium">
                                Active
                              </span>
                            )}
                          </div>
                          <StatusFilter
                            selectedStatus={status}
                            onStatusChange={setStatus}
                            options={REPORT_STATUSES}
                          />
                        </div>
                      </>
                    )}
                  </div>


                  {/* Filter Footer */}
                  {hasActiveFilters && (
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                      <button
                        onClick={resetFilters}
                        className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-red-600 transition-colors group"
                      >
                        <RotateCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" />
                        Reset All
                      </button>
                      <button
                        onClick={() => setShowFilters(false)}
                        className="bg-gradient-to-r from-red-500 to-red-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200"
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


        {/* Active Filters Pills */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className="text-sm font-medium text-gray-600">
              Active filters:
            </span>
            {category !== "All Categories" && (
              <button
                onClick={() => setCategory("All Categories")}
                className="group flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-200 text-red-700 rounded-full text-sm font-medium hover:bg-red-100 transition-colors"
              >
                <span>{category}</span>
                <X className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform duration-200" />
              </button>
            )}
            {!showHistory && status !== "All Status" && (
              <button
                onClick={() => setStatus("All Status")}
                className="group flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-200 text-red-700 rounded-full text-sm font-medium hover:bg-red-100 transition-colors"
              >
                <span>{status}</span>
                <X className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform duration-200" />
              </button>
            )}
            <button
              onClick={resetFilters}
              className="text-sm font-medium text-gray-500 hover:text-red-600 transition-colors underline decoration-dotted"
            >
              Clear all
            </button>
          </div>
        )}


        {/* Reports Table */}
        <ReportsTable
          selectedStatus={showHistory ? "Completed" : status}
          selectedCategory={category}
          searchQuery={searchQuery}
          hideCompleted={!showHistory}
          showHistory={showHistory}
        />


        <div className="mt-6">
          <Pagination />
        </div>
      </div>
    </div>
  );
}

