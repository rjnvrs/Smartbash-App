"use client";

import type { User, Status } from "./types";


interface UserRowProps {
  user: User;
  onStatusChange: (id: number, status: Status, role?: User["role"]) => void;
  showHistory?: boolean;
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

export default function UserRow({ user, onStatusChange, showHistory = false }: UserRowProps) {
  const handleUpdateStatus = (newStatus: Status) => {
    onStatusChange(user.id, newStatus, user.role);
  };


  return (
    <tr className="hover:bg-gray-50 border-b">
      <td className="px-4 py-3.5">{user.fullName}</td>
      <td className="px-4 py-3.5 text-sm">{user.email}</td>
      <td className="px-4 py-3.5">{user.contact}</td>
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-1">
          <span className="truncate max-w-[150px]">{user.details}</span>
          {user.proofUrl && (
            <a
              href={user.proofUrl}
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 hover:text-blue-800 hover:underline text-sm whitespace-nowrap"
            >
              View
            </a>
          )}
        </div>
      </td>
      <td className="px-4 py-3.5">{user.role}</td>
      <td className="px-4 py-3.5">
        <span
          className={`font-semibold text-sm px-2 py-1 rounded-full ${
            user.status === "Pending"
              ? "text-orange-600 bg-orange-50"
              : user.status === "Approved"
              ? "text-green-600 bg-green-50"
              : "text-red-600 bg-red-50"
          }`}
        >
          {user.status}
        </span>
      </td>
      <td className="px-4 py-3.5 text-center">
        {showHistory ? (
          <p className="text-sm text-gray-500 font-medium">
            {user.actionDate ? `${user.status} on ${formatActionDate(user.actionDate)}` : user.status}
          </p>
        ) : user.status === "Pending" ? (
          <div className="flex justify-center gap-2">
            <button
              onClick={() => handleUpdateStatus("Approved")}
              className="bg-green-500 text-white px-3 py-1.5 rounded-md text-sm hover:bg-green-600 transition-colors"
            >
              Approve
            </button>
            <button
              onClick={() => handleUpdateStatus("Removed")}
              className="bg-red-600 text-white px-3 py-1.5 rounded-md text-sm hover:bg-red-700 transition-colors"
            >
              Remove
            </button>
          </div>
        ) : (
          <button
            onClick={() => handleUpdateStatus("Pending")}
            className="bg-slate-800 text-white px-3 py-1.5 rounded-md text-sm hover:bg-slate-900 transition-colors"
          >
            Cancel
          </button>
        )}
      </td>
    </tr>
  );
}
