"use client";
//modified by don
import { useState } from "react";
import Sidebar from "../../../components/core-ui/official-components/Sidebar";
import SearchBar from "../../../components/core-ui/official-components/SearchBar";
import ResidentsTable from "../../../components/core-ui/official-components/residents-approval-components/ResidentsTable";
import StatusFilter from "../../../components/core-ui/official-components/StatusFilter";
import { ResidentStatus, ResidentData } from "../../../components/core-ui/official-components/residents-approval-components/ResidentRow";

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

// Define statuses for this page
const RESIDENT_STATUSES: (ResidentStatus | "All")[] = ["All", "Pending", "Approved", "Removed"];

export default function page() {
  const [status, setStatus] = useState<ResidentStatus | "All">("All");
  const [searchTerm, setSearchTerm] = useState(""); // <-- new state

  // Filter by both status and search term
  const filteredData = DATA.filter((r) => {
    const matchesStatus = status === "All" || r.status === status;
    const matchesSearch =
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleStatusUpdate = (id: number, newStatus: ResidentStatus) => {
    const index = DATA.findIndex((r) => r.id === id);
    if (index !== -1) DATA[index].status = newStatus;
    // You can trigger a re-render with setState if needed
  };

  return (
    <div className="flex min-h-screen bg-[#FAFAFA]">
      <Sidebar />

      <main className="flex-1 px-10 py-8">
        <h1 className="text-2xl font-semibold mb-5">
          Pending Resident Approvals
        </h1>

        {/* FLEX ROW: SearchBar LEFT, StatusFilter RIGHT */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1">
            <SearchBar onSearch={setSearchTerm} /> {/* <-- pass callback */}
          </div>

          <div className="flex-none">
            <StatusFilter
              selectedStatus={status}
              onStatusChange={setStatus}
              options={RESIDENT_STATUSES}
            />
          </div>
        </div>

        <div>
          <ResidentsTable data={filteredData} onUpdateStatus={handleStatusUpdate}/>
        </div>
      </main>
    </div>
  );
}
