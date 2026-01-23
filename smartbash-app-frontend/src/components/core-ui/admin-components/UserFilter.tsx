"use client";

import SearchBar from "../../../components/ui/SearchBar";
import StatusFilter from "../../../components/ui/StatusFilter";
import type { Role } from "./types";

type Tab = "All" | Role;

interface UserFiltersProps {
  tab: Tab;
  setTab: React.Dispatch<React.SetStateAction<Tab>>;
  search: string;
  setSearch: (val: string) => void;
  status: string;
  setStatus: (val: string) => void;
}

const tabs: Tab[] = ["All", "Brgy. Officials", "Services"];

export default function UserFilters({
  tab,
  setTab,
  search,
  setSearch,
  status,
  setStatus,
}: UserFiltersProps) {
 return (
  <div className="mb-4">
    {/* Tabs */}
    <div className="flex gap-2 bg-white rounded-lg p-1 shadow-sm mb-4 w-fit">
      {tabs.map((tabItem) => (
        <button
          key={tabItem}
          onClick={() => setTab(tabItem)}
          className={`px-4 py-2 rounded-lg transition-all duration-200 ${
            tab === tabItem
              ? "bg-blue-50 text-blue-700 border-b-2 border-blue-600"
              : "bg-transparent text-gray-600 hover:bg-gray-100"
          }`}
        >
          {tabItem}
        </button>
      ))}
    </div>

    {/* Search + Filter */}
    <div className="flex items-center gap-4 max-w-2xl"> 
      <div className="flex-1">
        <SearchBar value={search} onSearch={setSearch} />
      </div>
      <div className="w-48">
        <StatusFilter
          selectedStatus={status}
          onStatusChange={setStatus}
          options={["All Status", "Pending", "Approved", "Removed"]}
        />
      </div>
    </div>
  </div>
);
}