"use client";

import { ChangeEvent } from "react";

interface RoleSelectorProps {
  role: "Resident" | "Services" | "BrgyOfficials";
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
}

export default function RoleSelector({ role, onChange }:RoleSelectorProps) {
  return (
    <div>
      <label className="block mb-2 font-medium text-sm text-gray-700">
        Choose your Role
      </label>
      <select
        value={role}
        onChange={onChange}
        className="border border-gray-300 rounded-md px-4 py-2.5 w-full focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
      >
        <option value="Resident">Resident</option>
        <option value="Services">Services</option>
        <option value="BrgyOfficials">Brgy Officials</option>
      </select>
    </div>
  );
}