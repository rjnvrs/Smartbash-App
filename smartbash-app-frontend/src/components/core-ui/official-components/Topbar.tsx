"use client";

import SearchBar from "./SearchBar";
import { Bell } from "lucide-react";

interface TopbarProps {
  onSearch?: (value: string) => void;
}

export default function Topbar({ onSearch }: TopbarProps) {
  return (
    <div className="flex items-center justify-between px-6 py-4 bg-white border-b">
      <div className="flex-1 max-w-xl mr-6">
        <SearchBar onSearch={onSearch} />
      </div>

      <div className="flex items-center gap-4 mr-10">
        <button className="h-10 w-10 border rounded-md flex items-center justify-center hover:bg-gray-100 transition">
          <Bell className="h-5 w-5 opacity-70" />
        </button>

        <div className="h-10 w-10 bg-gray-300 rounded-full" />

        <div className="text-sm">
          <div className="font-medium">Email@gmail.com</div>
          <div className="text-gray-500 text-xs">Brgy. Official</div>
        </div>
      </div>
    </div>
  );
}
