"use client";
//modified by don
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

const RESIDENT_STATUSES: (ResidentStatus | "All")[] = ["All", "Pending", "Approved", "Removed"];

export default function ResidentsApproval() {
  const [residents, setResidents] = useState<ResidentData[]>(DATA);
  const [status, setStatus] = useState<ResidentStatus | "All">("All");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredData = residents.filter((r) => {
    const matchesStatus = status === "All" || r.status === status;
    const matchesSearch =
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleStatusUpdate = (id: number, newStatus: ResidentStatus) => {
    setResidents((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: newStatus } : r
      )
    );
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#FAFAFA]">
      {/* Sidebar */}
      <Sidebar />

      <main className="flex-1 px-4 sm:px-6 md:px-10 py-6 md:py-8">
        <h1 className="text-2xl font-semibold mb-5">
          Pending Resident Approvals
        </h1>

        {/* Filter + Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-6">
          <div className="flex-none w-full sm:w-auto">
            <StatusFilter
              selectedStatus={status}
              onStatusChange={setStatus}
              options={RESIDENT_STATUSES}
            />
          </div>

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
