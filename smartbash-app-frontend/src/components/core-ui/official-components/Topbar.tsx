"use client";

import SearchBar from "./SearchBar";
import { Bell } from "lucide-react";

export default function Topbar() {
  return (
    <div className="flex items-center justify-between px-6 py-4 bg-white border-b">
      
      {/* SEARCH BAR */}
      <div className="flex-1 max-w-xl mr-6">
        <SearchBar />
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-4 mr-10">
        {/* NOTIFICATION ICON */}
        <button className="h-10 w-10 border rounded-md flex items-center justify-center hover:bg-gray-100 transition">
          <Bell className="h-5 w-5 opacity-70"/>
        </button>

        {/* AVATAR */}
        <div className="h-10 w-10 bg-gray-300 rounded-full" />

        {/* USER INFO */}
        <div className="text-sm">
          <div className="font-medium">Email@gmail.com</div>
          <div className="text-gray-500 text-xs">Brgy. Official</div>
        </div>
      </div>
    </div>
  );
}
