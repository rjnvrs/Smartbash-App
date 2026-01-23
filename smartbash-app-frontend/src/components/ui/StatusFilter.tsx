"use client";

import { ChangeEvent } from "react";

interface StatusFilterProps<T extends string> {
  selectedStatus: T;
  onStatusChange: (value: T) => void;
  options: T[];
}

export default function StatusFilter<T extends string>({ selectedStatus, onStatusChange, options }: StatusFilterProps<T>) {
  return (
    <div className="w-48">
      <select
        value={selectedStatus}
        onChange={(e: ChangeEvent<HTMLSelectElement>) => onStatusChange(e.target.value as T)}
        className="w-full px-4 py-2.5 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-700"
      >
        {options.map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </select>
    </div>
  );
}
