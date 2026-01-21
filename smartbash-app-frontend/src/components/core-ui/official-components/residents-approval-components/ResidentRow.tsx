"use client";

import { useState } from "react";
import { TableRow, TableCell } from "@/components/ui/table";

export type ResidentStatus = "Pending" | "Approved" | "Removed";

export interface ResidentData {
  id: number;
  name: string;
  email: string;
  contact: string;
  gender: string;
  age: number;
  details: string;
  status: ResidentStatus;
}

interface ResidentRowProps {
  data: ResidentData;
  onUpdateStatus?: (id: number, status: ResidentStatus) => void;
}

export default function ResidentRow({ data, onUpdateStatus }: ResidentRowProps) {
  const [status, setStatus] = useState(data.status);

  // Determine status color
  const statusColor =
    status === "Pending"
      ? "text-orange-500"
      : status === "Approved"
      ? "text-green-600"
      : status === "Removed"
      ? "text-gray-400"
      : "text-red-600";

  const handleApprove = () => {
    setStatus("Approved");
    if (onUpdateStatus) onUpdateStatus(data.id, "Approved");
  };

  const handleRemove = () => {
    setStatus("Removed");
    if (onUpdateStatus) onUpdateStatus(data.id, "Removed");
  };

  const handleCancel = () => {
    setStatus("Pending");
    if (onUpdateStatus) onUpdateStatus(data.id, "Pending");
  };

  return (
    <TableRow>
      <TableCell>{data.name}</TableCell>
      <TableCell className="break-all">{data.email}</TableCell>
      <TableCell>{data.contact}</TableCell>
      <TableCell>
        {data.gender}, {data.age}
      </TableCell>

      <TableCell className="col-span-2">
        {data.details}
        <br />
        <span className="text-blue-500 text-xs cursor-pointer">View</span>
      </TableCell>

      <TableCell className={`font-medium ${statusColor}`}>{status}</TableCell>

      <TableCell>
        <div className="flex gap-2">
          {status === "Pending" ? (
            <>
              <button
                onClick={handleApprove}
                className="px-4 py-1 rounded-full bg-green-500 text-white text-xs"
              >
                Approve
              </button>
              <button
                onClick={handleRemove}
                className="px-4 py-1 rounded-full bg-red-600 text-white text-xs"
              >
                Remove
              </button>
            </>
          ) : (
            <button
              onClick={handleCancel}
              className="px-6 py-1 rounded-full bg-black text-white text-xs"
            >
              Cancel
            </button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}
