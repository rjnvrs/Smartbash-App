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
  actionDate?: string;
}


interface ResidentRowProps {
  data: ResidentData;
  onUpdateStatus?: (id: number, status: ResidentStatus, date?: string) => void;
  mobile?: boolean;
}


export default function ResidentRow({
  data,
  onUpdateStatus,
  mobile = false,
}: ResidentRowProps) {
  const [status, setStatus] = useState<ResidentStatus>(data.status);
  const [actionDate, setActionDate] = useState<string | undefined>(
    data.actionDate
  );


  const statusColor =
    status === "Pending"
      ? "text-orange-500"
      : status === "Approved"
      ? "text-green-600"
      : "text-gray-400";


  const update = (newStatus: ResidentStatus) => {
    const date = new Date().toLocaleDateString("en-PH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    setStatus(newStatus);
    setActionDate(date);
    onUpdateStatus?.(data.id, newStatus, date);
  };


  const actionText =
    status !== "Pending" && actionDate
      ? `${status} is done on ${actionDate}`
      : "";


  // Function to handle View details click
  const handleViewDetails = () => {
    alert(
      `Details for ${data.name}:\n\nEmail: ${data.email}\nContact: ${data.contact}\nGender: ${data.gender}\nAge: ${data.age}\nDetails: ${data.details}`
    );
  };


  /* MOBILE CARD VIEW */
  if (mobile) {
    return (
      <div className="border rounded-xl p-4 space-y-2 text-sm">
        <div className="flex justify-between items-center">
          <div>
            <p className="font-semibold">{data.name}</p>
            <p className="text-gray-500 break-all">{data.email}</p>
          </div>
          <button
            onClick={handleViewDetails}
            className="px-2 py-1 rounded bg-blue-500 text-white text-xs"
          >
            View
          </button>
        </div>


        <div className="flex justify-between">
          <span>📞 {data.contact}</span>
          <span>
            {data.gender}, {data.age}
          </span>
        </div>


        <p className={`font-medium ${statusColor}`}>{status}</p>


        {/* Buttons OR Action Date */}
        <div className="pt-2">
          {status === "Pending" ? (
            <div className="flex gap-2">
              <button
                onClick={() => update("Approved")}
                className="flex-1 py-1 rounded bg-green-500 text-white"
              >
                Approve
              </button>
              <button
                onClick={() => update("Removed")}
                className="flex-1 py-1 rounded bg-red-600 text-white"
              >
                Remove
              </button>
            </div>
          ) : (
            <p className="text-sm text-gray-500 font-medium">{actionText}</p>
          )}
        </div>
      </div>
    );
  }


  /* DESKTOP TABLE ROW */
  return (
    <TableRow>
      <TableCell>{data.name}</TableCell>
      <TableCell className="break-all">{data.email}</TableCell>
      <TableCell>{data.contact}</TableCell>
      <TableCell>
        {data.gender}, {data.age}
      </TableCell>
      {/* Details column with View button */}
      <TableCell>
        <button
          onClick={handleViewDetails}
          className="px-3 py-1 rounded bg-blue-500 text-white text-xs hover:bg-blue-600"
        >
          View
        </button>
      </TableCell>
      <TableCell className={`font-medium ${statusColor}`}>{status}</TableCell>
      {/* Action + Date */}
      <TableCell>
        {status === "Pending" ? (
          <div className="flex gap-2">
            <button
              onClick={() => update("Approved")}
              className="px-4 py-1 rounded-full bg-green-500 text-white text-xs"
            >
              Approve
            </button>
            <button
              onClick={() => update("Removed")}
              className="px-4 py-1 rounded-full bg-red-600 text-white text-xs"
            >
              Remove
            </button>
          </div>
        ) : (
          <p className="text-sm text-gray-500 font-medium">{actionText}</p>
        )}
      </TableCell>
    </TableRow>
  );
}
