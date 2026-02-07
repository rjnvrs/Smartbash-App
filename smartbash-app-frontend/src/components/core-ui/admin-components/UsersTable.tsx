"use client";

import type { User, Status } from "./types";
import UserRow from "./UserRow";

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
} from "../../../components/ui/table";

interface UsersTableProps {
  users: User[];
  onStatusChange: (id: number, status: Status, role?: User["role"]) => void;
}

export default function UsersTable({ users, onStatusChange }: UsersTableProps) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-gray-100">
            <TableRow>
              <TableHead className="px-4 py-3 font-semibold">Full Name</TableHead>
              <TableHead className="px-4 py-3 font-semibold">Email Address</TableHead>
              <TableHead className="px-4 py-3 font-semibold">Contact No.</TableHead>
              <TableHead className="px-4 py-3 font-semibold">Details</TableHead>
              <TableHead className="px-4 py-3 font-semibold">Position</TableHead>
              <TableHead className="px-4 py-3 font-semibold">Status</TableHead>
              <TableHead className="px-4 py-3 font-semibold text-center">Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {users.map((user) => (
              <UserRow key={user.id} user={user} onStatusChange={onStatusChange} />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
