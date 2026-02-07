"use client";
//modified by don
import { useEffect, useState } from "react";
import Sidebar from "../../../../components/core-ui/official-components/Sidebar";
import SearchBar from "../../../../components/ui/SearchBar";
import ResidentsTable from "../../../../components/core-ui/official-components/residents-approval-components/ResidentsTable";
import StatusFilter from "../../../../components/ui/StatusFilter";
import { ResidentStatus, ResidentData } from "../../../../components/core-ui/official-components/residents-approval-components/ResidentRow";
import { apiFetch } from "@/lib/api";

const RESIDENT_STATUSES: (ResidentStatus | "All")[] = ["All", "Pending", "Approved", "Removed"];

export default function ResidentsApproval() {
  const [residents, setResidents] = useState<ResidentData[]>([]);
  const [status, setStatus] = useState<ResidentStatus | "All">("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const loadResidents = async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await apiFetch("/auth/officials/residents/pending/", {
        method: "GET",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load residents");
      setResidents(data.residents || []);
    } catch (err: any) {
      setError(err.message || "Failed to load residents");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadResidents();
  }, []);

  const filteredData = residents.filter((r) => {
    const matchesStatus = status === "All" || r.status === status;
    const matchesSearch =
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleStatusUpdate = async (id: number, newStatus: ResidentStatus) => {
    try {
      if (newStatus === "Approved") {
        const res = await apiFetch("/auth/officials/residents/approve/", {
          method: "POST",
          body: JSON.stringify({ res_id: id }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Approve failed");
      }

      if (newStatus === "Removed") {
        const res = await apiFetch("/auth/officials/residents/remove/", {
          method: "POST",
          body: JSON.stringify({ res_id: id }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Remove failed");
      }

      if (newStatus === "Pending") {
        // Re-fetch to restore pending list
        await loadResidents();
        return;
      }

      setResidents((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, status: newStatus } : r
        )
      );
    } catch (err: any) {
      setError(err.message || "Update failed");
    }
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

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm">
            {error}
          </div>
        )}

        {isLoading && (
          <div className="mb-4 text-sm text-gray-500">Loading residents...</div>
        )}

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
