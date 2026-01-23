"use client";

import { ChangeEvent } from "react";
import { Search } from "lucide-react";

interface SearchBarProps {
  value: string;
  onSearch: (value: string) => void;
}

export default function SearchBar({ value, onSearch }: SearchBarProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onSearch(e.target.value);
  };

  return (
    <div className="w-full">
      <div className="flex items-center gap-3 bg-white rounded-full px-4 py-2 shadow-sm border w-full">
        <Search className="w-4 h-4 opacity-60" />
        <input
          type="text"
          placeholder="Search"
          value={value}
          onChange={handleChange}
          className="w-full outline-none text-sm"
        />
      </div>
    </div>
  );
}
