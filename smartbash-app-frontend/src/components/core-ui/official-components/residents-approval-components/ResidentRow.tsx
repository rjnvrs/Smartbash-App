"use client";

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
  proofUrl?: string;
}

interface ResidentRowProps {
  data: ResidentData;
  onUpdateStatus?: (id: number, status: ResidentStatus) => void;
  mobile?: boolean;
}

function formatActionDate(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function ResidentRow({
  data,
  onUpdateStatus,
  mobile = false,
}: ResidentRowProps) {
  const statusColor =
    data.status === "Pending"
      ? "text-orange-500"
      : data.status === "Approved"
        ? "text-green-600"
        : "text-gray-500";

  const actionText =
    data.status !== "Pending" && data.actionDate
      ? `${data.status} on ${formatActionDate(data.actionDate)}`
      : "";

  if (mobile) {
    return (
      <div className="border rounded-xl p-4 space-y-2 text-sm">
        <div>
          <p className="font-semibold">{data.name}</p>
          <p className="text-gray-500 break-all">{data.email}</p>
        </div>

        <div className="flex justify-between">
          <span>Contact: {data.contact}</span>
          <span>
            {data.gender}, {data.age}
          </span>
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

        <p className={`font-medium ${statusColor}`}>{data.status}</p>

        <div className="pt-2">
          {data.status === "Pending" ? (
            <div className="flex gap-2">
              <button
                onClick={() => onUpdateStatus?.(data.id, "Approved")}
                className="flex-1 py-1 rounded bg-green-500 text-white"
              >
                Approve
              </button>
              <button
                onClick={() => onUpdateStatus?.(data.id, "Removed")}
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

  return (
    <TableRow>
      <TableCell>{data.name}</TableCell>
      <TableCell className="break-all">{data.email}</TableCell>
      <TableCell>{data.contact}</TableCell>
      <TableCell>
        {data.gender}, {data.age}
      </TableCell>
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
      <TableCell className={`font-medium ${statusColor}`}>{data.status}</TableCell>
      <TableCell>
        {data.status === "Pending" ? (
          <div className="flex gap-2">
            <button
              onClick={() => onUpdateStatus?.(data.id, "Approved")}
              className="px-4 py-1 rounded-full bg-green-500 text-white text-xs"
            >
              Approve
            </button>
            <button
              onClick={() => onUpdateStatus?.(data.id, "Removed")}
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
