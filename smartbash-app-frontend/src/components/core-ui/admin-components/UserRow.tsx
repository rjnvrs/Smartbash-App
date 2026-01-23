"use client";

import type { User, Status } from "./types";

interface UserRowProps {
  user: User;
  onStatusChange: (id: number, status: Status) => void;
}

export default function UserRow({ user, onStatusChange }: UserRowProps) {
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

      <td className="px-4 py-3.5">
        <div className="flex justify-center gap-2">
          {user.status === "Pending" ? (
            <>
              <button
                onClick={() => onStatusChange(user.id, "Approved")}
                className="bg-green-500 text-white px-3 py-1.5 rounded-md text-sm hover:bg-green-600 transition-colors"
              >
                Approve
              </button>
              <button
                onClick={() => onStatusChange(user.id, "Removed")}
                className="bg-red-600 text-white px-3 py-1.5 rounded-md text-sm hover:bg-red-700 transition-colors"
              >
                Remove
              </button>
            </>
          ) : (
            <button
              onClick={() => onStatusChange(user.id, "Pending")}
              className="bg-gray-800 text-white px-3 py-1.5 rounded-md text-sm hover:bg-black transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}