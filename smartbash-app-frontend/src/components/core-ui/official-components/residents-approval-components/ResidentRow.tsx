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
  proofUrl?: string;
}

interface ResidentRowProps {
  data: ResidentData;
  onUpdateStatus?: (id: number, status: ResidentStatus) => void;
  mobile?: boolean;
}

export default function ResidentRow({
  data,
  onUpdateStatus,
  mobile = false,
}: ResidentRowProps) {
  const [status, setStatus] = useState(data.status);

  const statusColor =
    status === "Pending"
      ? "text-orange-500"
      : status === "Approved"
      ? "text-green-600"
      : "text-gray-400";

  const update = (newStatus: ResidentStatus) => {
    setStatus(newStatus);
    onUpdateStatus?.(data.id, newStatus);
  };

  /* ✅ MOBILE CARD VIEW */
  if (mobile) {
    return (
      <div className="border rounded-xl p-4 space-y-2 text-sm">
        <div>
          <p className="font-semibold">{data.name}</p>
          <p className="text-gray-500 break-all">{data.email}</p>
        </div>

        <div className="flex justify-between">
          <span>📞 {data.contact}</span>
          <span>{data.gender}, {data.age}</span>
        </div>

        <p className="text-gray-600">
          {data.details}{" "}
          {data.proofUrl && (
            <a
              href={data.proofUrl}
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 underline ml-1"
            >
              View
            </a>
          )}
        </p>

        <p className={`font-medium ${statusColor}`}>{status}</p>

        <div className="flex gap-2 pt-2">
          {status === "Pending" ? (
            <>
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
            </>
          ) : (
            <button
              onClick={() => update("Pending")}
              className="w-full py-1 rounded bg-black text-white"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    );
  }

  /* ✅ DESKTOP TABLE ROW (UNCHANGED LOOK) */
  return (
    <TableRow>
      <TableCell>{data.name}</TableCell>
      <TableCell className="break-all">{data.email}</TableCell>
      <TableCell>{data.contact}</TableCell>
      <TableCell>{data.gender}, {data.age}</TableCell>
      <TableCell>
        {data.details}{" "}
        {data.proofUrl && (
          <a
            href={data.proofUrl}
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 underline ml-1"
          >
            View
          </a>
        )}
      </TableCell>
      <TableCell className={`font-medium ${statusColor}`}>{status}</TableCell>
      <TableCell>
        <div className="flex gap-2">
          {status === "Pending" ? (
            <>
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
            </>
          ) : (
            <button
              onClick={() => update("Pending")}
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
