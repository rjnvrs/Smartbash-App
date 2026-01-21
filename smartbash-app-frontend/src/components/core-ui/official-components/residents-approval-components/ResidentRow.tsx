"use client"

import { useState } from "react";

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
    <div className="grid grid-cols-8 items-center bg-[#FAFAFA] rounded-xl px-4 py-4 text-sm">
      <div>{data.name}</div>
      <div className="break-all">{data.email}</div>
      <div>{data.contact}</div>
      <div className="whitespace-nowrap">
        {data.gender}, {data.age}
      </div>

      <div className="col-span-2">
        {data.details}
        <br />
        <span className="text-blue-500 text-xs cursor-pointer">
          View
        </span>
      </div>

      <div className={`font-medium ${statusColor}`}>{status}</div>

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
        ) : status === "Approved" ? (
          <button
            onClick={handleCancel}
            className="px-6 py-1 rounded-full bg-black text-white text-xs"
          >
            Cancel
          </button>
        ) : status === "Removed" ? (
          <button
            onClick={handleCancel}
            className="px-6 py-1 rounded-full bg-black text-white text-xs"
          >
            Cancel
          </button>
        ) : null}
      </div>
    </div>
  );
}
