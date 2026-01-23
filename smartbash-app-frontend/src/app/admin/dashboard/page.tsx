"use client";

import { useState } from "react";
import AdminHeader from "../../../components/core-ui/admin-components/AdminHeader";
import Pagination from "../../../components/ui/Pagination";
import UserFilters from "../../../components/core-ui/admin-components/UserFilter";
import UsersTable from "../../../components/core-ui/admin-components/UsersTable";

import type { User, Status, Role } from "../../../components/core-ui/admin-components/types";

const INITIAL_USERS: User[] = [
  {
    id: 1,
    fullName: "Donita Rose Seguerra",
    email: "Donitarose@gmail.com",
    contact: "094345435",
    details: "Valid ID, Proof of Authority",
    status: "Pending",
    role: "Brgy. Officials",
  },
  {
    id: 2,
    fullName: "Donita Rose Seguerra",
    email: "Donitarose@gmail.com",
    contact: "094345435",
    details: "Valid ID, Proof of Authority",
    status: "Approved",
    role: "Services",
  },
  {
    id: 3,
    fullName: "Donita Rose Seguerra",
    email: "Donitarose@gmail.com",
    contact: "094345435",
    details: "Valid ID",
    status: "Removed",
    role: "Brgy. Officials",
  },
];

export default function Page() {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [tab, setTab] = useState<"All" | Role>("All");

  const handleStatusChange = (id: number, newStatus: Status) => {
    setUsers((prev) =>
      prev.map((user) => (user.id === id ? { ...user, status: newStatus } : user))
    );
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

        <UsersTable users={filteredUsers} onStatusChange={handleStatusChange} />

        <Pagination />
      </main>
    </div>
  );
}
