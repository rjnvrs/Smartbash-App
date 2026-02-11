"use client";


import { useState } from "react";
import Sidebar from "../../../../components/core-ui/official-components/Sidebar";
import SearchBar from "../../../../components/ui/SearchBar";
import ResidentsTable from "../../../../components/core-ui/official-components/residents-approval-components/ResidentsTable";
import StatusFilter from "../../../../components/ui/StatusFilter";
import { ResidentStatus, ResidentData } from "../../../../components/core-ui/official-components/residents-approval-components/ResidentRow";


const DATA: ResidentData[] = [
  {
    id: 1,
    name: "Karl Owen Pelayo",
    email: "KarlPelayo@gmail.com",
    contact: "094345435",
    gender: "M",
    age: 17,
    details: "Valid ID, Proof of Authority",
    status: "Pending",
  },
  {
    id: 2,
    name: "Mark Daniel Fernandez",
    email: "MarkFernandez@gmail.com",
    contact: "094345435",
    gender: "M",
    age: 21,
    details: "Valid ID, Proof of Authority",
    status: "Approved",
    actionDate: "Feb 10, 2026",
  },
  {
    id: 3,
    name: "Rica Jane Navares",
    email: "Ricanavares@gmail.com",
    contact: "094345435",
    gender: "F",
    age: 21,
    details: "Valid ID",
    status: "Removed",
    actionDate: "Feb 09, 2026",
  },
  {
    id: 4,
    name: "Donita Seguerra yeaah",
    email: "trytry1@gmail.com",
    contact: "094345435",
    gender: "F",
    age: 12,
    details: "Valid ID",
    status: "Pending",
  },
];


export default function ResidentsApproval() {
  const [residents, setResidents] = useState<ResidentData[]>(DATA);
  const [status, setStatus] = useState<ResidentStatus | "All">("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [showHistory, setShowHistory] = useState(false);


  // Update resident status and assign actionDate
  const handleStatusUpdate = (id: number, newStatus: ResidentStatus) => {
    const date =
      newStatus !== "Pending"
        ? new Date().toLocaleDateString("en-PH", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })
        : undefined;


    setResidents((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: newStatus, actionDate: date } : r
      )
    );
  };


  // Filter residents
  const filteredData = residents.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.email.toLowerCase().includes(searchTerm.toLowerCase());


    if (showHistory) {
      const matchesStatus =
        status === "All" || r.status === status; // only Approved/Removed in filter
      return r.actionDate !== undefined && matchesStatus && matchesSearch;
    }


    // Pending view: only show Pending residents, ignore status filter
    return r.status === "Pending" && matchesSearch;
  });


  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#FAFAFA]">
      <Sidebar />


      <main className="flex-1 px-4 sm:px-6 md:px-10 py-6 md:py-8">
        <div className="flex justify-between items-center mb-5">
          <h1 className="text-2xl font-semibold">
            {showHistory ? "Resident History" : "Pending Resident Approvals"}
          </h1>


          <button
            onClick={() => setShowHistory(!showHistory)}
            className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600"
          >
            {showHistory ? "Back to Approvals" : "View History"}
          </button>
        </div>


        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-6">
          {/* Status filter only in history */}
          {showHistory && (
            <div className="flex-none w-full sm:w-auto">
              <StatusFilter
                selectedStatus={status}
                onStatusChange={setStatus}
                options={["All", "Approved", "Removed"]}
              />
            </div>
          )}


          {/* Search bar */}
          <div className="ml-auto w-full sm:w-auto">
            <SearchBar value={searchTerm} onSearch={setSearchTerm} />
          </div>
        </div>


        {/* Table */}
        <div className="overflow-x-auto">
          <ResidentsTable
            data={filteredData}
            onUpdateStatus={handleStatusUpdate}
          />
        </div>
      </main>
    </div>
  );
}


