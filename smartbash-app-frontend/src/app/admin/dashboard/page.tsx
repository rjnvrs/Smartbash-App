"use client";

import { useEffect, useState } from "react";
import AdminHeader from "../../../components/core-ui/admin-components/AdminHeader";
import Pagination from "../../../components/ui/Pagination";
import UserFilters from "../../../components/core-ui/admin-components/UserFilter";
import UsersTable from "../../../components/core-ui/admin-components/UsersTable";
import { apiFetch, parseJsonSafe } from "@/lib/api";

import type { User, Status, Role } from "../../../components/core-ui/admin-components/types";

export default function Page() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("admin_search") || "";
  });
  const [statusFilter, setStatusFilter] = useState(() => {
    if (typeof window === "undefined") return "All Status";
    return localStorage.getItem("admin_status") || "All Status";
  });
  const [tab, setTab] = useState<"All" | Role>(() => {
    if (typeof window === "undefined") return "All";
    return (localStorage.getItem("admin_tab") as "All" | Role) || "All";
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
      setUsers((data?.users || []) as User[]);
    } catch (err: any) {
      setError(err.message || "Failed to load approvals");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("admin_search", search);
    localStorage.setItem("admin_status", statusFilter);
    localStorage.setItem("admin_tab", tab);
  }, [search, statusFilter, tab]);

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
    .filter((user) => (tab === "All" ? true : user.role === tab))
    .filter((user) => (statusFilter === "All Status" ? true : user.status === statusFilter))
    .filter((user) =>
      user.fullName.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminHeader />
      <main className="p-6">
        <h2 className="text-xl font-semibold mb-4">Pending Approvals</h2>

        <UserFilters
          tab={tab}
          setTab={setTab}
          search={search}
          setSearch={setSearch}
          status={statusFilter}
          setStatus={setStatusFilter}
        />

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
            {error}
          </div>
        )}
        {isLoading && (
          <div className="mb-4 text-sm text-gray-500">Loading approvals...</div>
        )}

        <UsersTable users={filteredUsers} onStatusChange={handleStatusChange} />

        <Pagination />
      </main>
    </div>
  );
}
