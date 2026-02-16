"use client";

import { useEffect, useState } from "react";
import AdminHeader from "../../../components/core-ui/admin-components/AdminHeader";
import Pagination from "../../../components/ui/Pagination";
import UserFilters from "../../../components/core-ui/admin-components/UserFilter";
import UsersTable from "../../../components/core-ui/admin-components/UsersTable";
import { apiFetch, parseJsonSafe } from "@/lib/api";

import type { User, Status, Role } from "../../../components/core-ui/admin-components/types";

export default function Page() {
  const PAGE_SIZE = 6;
  const normalizeRole = (role: string | undefined) =>
    (role || "").trim().toLowerCase();
  const isServiceRole = (role: string | undefined) =>
    normalizeRole(role).includes("service");

  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [tab, setTab] = useState<"All" | Role>("All");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showHistory, setShowHistory] = useState(false);

  const loadUsers = async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await apiFetch("/auth/admin/approvals/", { method: "GET" });
      const { data, text } = await parseJsonSafe(res);
      if (!res.ok) {
        if (!data) throw new Error(text || "Failed to load approvals");
        throw new Error(data.message || "Failed to load approvals");
      }
      const normalizedUsers = ((data?.users || []) as User[]).map((u) => {
        const role: Role = isServiceRole(u.role) ? "Services" : "Brgy. Officials";
        return {
          ...u,
          role,
          key: `${role}-${u.id}`,
        };
      });
      setUsers(normalizedUsers);
    } catch (err: any) {
      setError(err.message || "Failed to load approvals");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleStatusChange = async (id: number, newStatus: Status, role?: Role) => {
    const targetRole = role || users.find((u) => u.id === id)?.role;
    if (!targetRole) return;
    try {
      const res = await apiFetch("/auth/admin/approvals/update/", {
        method: "POST",
        body: JSON.stringify({ id, status: newStatus, role: targetRole }),
      });
      const { data, text } = await parseJsonSafe(res);
      if (!res.ok) {
        if (!data) throw new Error(text || "Update failed");
        throw new Error(data.message || "Update failed");
      }
      await loadUsers();
    } catch (err: any) {
      setError(err.message || "Update failed");
    }
  };

  const filteredUsers = users
    .filter((user) => {
      if (tab === "All") return true;
      if (tab === "Services") return isServiceRole(user.role);
      return !isServiceRole(user.role);
    })
    .filter((user) => {
      if (showHistory) return user.status !== "Pending";
      return user.status === "Pending";
    })
    .filter((user) => {
      if (!showHistory) return true;
      if (statusFilter === "All Status") return true;
      return user.status === statusFilter;
    })
    .filter((user) => user.fullName.toLowerCase().includes(search.toLowerCase()));

  useEffect(() => {
    setCurrentPage(1);
  }, [tab, statusFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const pagedUsers = filteredUsers.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminHeader />
      <main className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {showHistory ? "Approval History" : "Pending Approvals"}
          </h2>
          <button
            onClick={() => {
              setShowHistory((prev) => !prev);
              setStatusFilter("All Status");
              setCurrentPage(1);
            }}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            {showHistory ? "Back to Approvals" : "View History"}
          </button>
        </div>

        <UserFilters
          tab={tab}
          setTab={setTab}
          search={search}
          setSearch={setSearch}
          status={statusFilter}
          setStatus={setStatusFilter}
          showHistory={showHistory}
        />

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
            {error}
          </div>
        )}
        {isLoading && (
          <div className="mb-4 text-sm text-gray-500">Loading approvals...</div>
        )}

        <UsersTable
          users={pagedUsers}
          onStatusChange={handleStatusChange}
          showHistory={showHistory}
        />

        <Pagination
          currentPage={Math.min(currentPage, totalPages)}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </main>
    </div>
  );
}
