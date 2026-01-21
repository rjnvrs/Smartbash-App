"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; 
import { Flame, MapPin, SlidersHorizontal, Waves } from "lucide-react"

export default function RecentReports() {
  const [open, setOpen] = useState(false);
  const router = useRouter(); 

  const goToMap = () => {
    router.push("/officials/incident-map"); 
  };

  return (
    <div className="mt-8">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Recent Reports</h2>

        {/* FILTER + MAP */}
        <div className="relative flex items-center gap-2">
          {/* FILTER ICON */}
          <button
            onClick={() => setOpen(!open)}
            className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition border"
          >
            <SlidersHorizontal className="h-6 w-6" />
          </button>

          {/* MAP ICON */}
          <button
            onClick={goToMap}
            className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition border"
          >
            <MapPin className="h-6 w-6" />
          </button>

          {/* DROPDOWN */}
          {open && (
            <div className="absolute right-0 top-12 w-40 bg-white border rounded-lg shadow-lg text-sm z-10">
              {["All", "Pending", "In Progress", "Completed"].map((item) => (
                <div
                  key={item}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  {item}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* TABLE HEADER */}
      <div className="grid grid-cols-4 px-6 py-3 text-sm text-gray-500">
        <div>Category</div>
        <div>Location</div>
        <div>Date & Time</div>
        <div>Status</div>
      </div>

      {/* ROWS */}
      <div className="space-y-4 mt-2">
        {/* FIRE — IN PROGRESS */}
        <div className="grid grid-cols-4 items-center px-6 py-4 bg-white rounded-xl shadow-sm">
          <div className="flex items-center gap-2 font-medium text-red-600">
            <Flame className="h-5 w-5 text-red-500" />
            Fire
          </div>
          <div className="text-gray-700">Laguna, Brgy. Basak, Cebu City</div>
          <div>Dec 4, 10:26 AM</div>
          <div className="text-blue-600 font-medium">In progress</div>
        </div>

        {/* FLOOD — COMPLETED */}
        <div className="grid grid-cols-4 items-center px-6 py-4 bg-white rounded-xl shadow-sm">
          <div className="flex items-center gap-2 font-medium text-blue-600">
            <Waves className="h-5 w-5 text-blue-500" />
            Flood
          </div>
          <div className="text-gray-700">Laguna, Brgy. Basak, Cebu City</div>
          <div>Dec 5, 10:26 AM</div>
          <div className="text-green-600 font-medium">Completed</div>
        </div>

        {/* FIRE — PENDING */}
        <div className="grid grid-cols-4 items-center px-6 py-4 bg-white rounded-xl shadow-sm">
          <div className="flex items-center gap-2 font-medium text-red-600">
            <Flame className="h-5 w-5 text-red-500" />
            Fire
          </div>
          <div className="text-gray-700">Laguna, Brgy. Basak, Cebu City</div>
          <div>Dec 5, 10:26 AM</div>
          <div className="text-orange-600 font-medium">Pending</div>
        </div>
      </div>
    </div>
  );
}
