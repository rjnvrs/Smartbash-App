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
    fullName: "Rose Seguerra",
    email: "Donitarose@gmail.com",
    contact: "094345435",
    details: "Valid ID, Proof of Authority",
    status: "Approved",
    role: "Services",
    actionDate: "Feb 11, 2026",
  },
  {
    id: 3,
    fullName: "Don Rose Seguerra",
    email: "Donitarose@gmail.com",
    contact: "094345435",
    details: "Valid ID",
    status: "Removed",
    role: "Brgy. Officials",
    actionDate: "Feb 10, 2026",
  },
];


export default function Page() {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [tab, setTab] = useState<"All" | Role>("All");
  const [showHistory, setShowHistory] = useState(false);


  const handleStatusChange = (id: number, newStatus: Status) => {
    const date = new Date().toLocaleDateString("en-PH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });


    setUsers((prev) =>
      prev.map((user) =>
        user.id === id
          ? { ...user, status: newStatus, actionDate: newStatus !== "Pending" ? date : undefined }
          : user
      )
    );
  };


  // Filters users based on tab, status, search
  const filteredUsers = users
    .filter((user) => (tab === "All" ? true : user.role === tab))
    .filter((user) => (statusFilter === "All Status" ? true : user.status === statusFilter))
    .filter((user) =>
      user.fullName.toLowerCase().includes(search.toLowerCase())
    );


  // Show history or pending based on toggle
  const displayedUsers = filteredUsers.filter((user) =>
    showHistory ? user.actionDate : user.status === "Pending"
  );


  return (
    <div className="min-h-screen bg-gray-100">
      <AdminHeader />
      <main className="p-6">
        {/* Header + History Toggle */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            {showHistory ? "Approval History" : "Pending Approvals"}
          </h2>


          <button
            onClick={() => setShowHistory(!showHistory)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {showHistory ? "Show Pending" : "Show History"}
          </button>
        </div>


        {/* Filters */}
        <UserFilters
          tab={tab}
          setTab={setTab}
          search={search}
          setSearch={setSearch}
          status={statusFilter}
          setStatus={setStatusFilter}
        />


        {/* Table */}
        <UsersTable users={displayedUsers} onStatusChange={handleStatusChange} />


        {/* Pagination */}
        <Pagination />
      </main>
    </div>
  );
}



