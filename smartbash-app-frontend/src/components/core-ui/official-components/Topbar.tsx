"use client";

import { useState } from "react";
import SearchBar from "../../ui/SearchBar";
import { Bell } from "lucide-react";

interface TopbarProps {
  onSearch?: (value: string) => void;
}

export default function Topbar({ onSearch }: TopbarProps) {
  const [searchValue, setSearchValue] = useState("");

  const handleSearch = (value: string) => {
    setSearchValue(value);
    onSearch?.(value);
  };

  return (
    <div className="mt-16">
      <div className="flex flex-wrap items-center justify-between px-4 py-4 bg-white border-b gap-4">
        {/* Search */}
        <div className="flex-1 min-w-[250px] lg:max-w-xl">
          <SearchBar value={searchValue} onSearch={handleSearch} />
        </div>

        {/* Profile + Bell */}
        <div className="flex items-center gap-3">
          <button className="h-10 w-10 border rounded-md flex items-center justify-center hover:bg-gray-100 transition">
            <Bell className="h-5 w-5 opacity-70" />
          </button>

          <div className="h-10 w-10 bg-gray-300 rounded-full" />

          <div className="text-sm hidden sm:block">
            <div className="font-medium">Email@gmail.com</div>
            <div className="text-gray-500 text-xs">Brgy. Official</div>
          </div>
        </div>
      </div>
    </div>
  );
}
