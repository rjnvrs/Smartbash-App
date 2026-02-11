"use client";


import { useState } from "react";
import type { User, Status } from "./types";


interface UserRowProps {
  user: User;
  onStatusChange: (id: number, status: Status, date?: string) => void;
}


export default function UserRow({ user, onStatusChange }: UserRowProps) {
  const [actionDate, setActionDate] = useState<string | undefined>(user.actionDate);


  const handleUpdateStatus = (newStatus: Status) => {
    const date = new Date().toLocaleDateString("en-PH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    setActionDate(date);
    onStatusChange(user.id, newStatus, date);
  };


  const actionText = user.status !== "Pending" && actionDate
    ? `${user.status} is done on ${actionDate}`
    : "";


  return (
    <tr className="hover:bg-gray-50 border-b">
      <td className="px-4 py-3.5">{user.fullName}</td>
      <td className="px-4 py-3.5 text-sm">{user.email}</td>
      <td className="px-4 py-3.5">{user.contact}</td>
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-1">
          <span className="truncate max-w-[150px]">{user.details}</span>
          <a
            href="#"
            className="text-blue-600 hover:text-blue-800 hover:underline text-sm whitespace-nowrap"
          >
            View
          </a>
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
        {user.status === "Pending" ? (
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
          <p className="text-gray-500 text-sm font-medium">{actionText}</p>
        )}
      </td>
    </tr>
  );
}
