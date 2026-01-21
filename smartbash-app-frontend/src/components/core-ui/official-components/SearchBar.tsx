"use client";

import { useState, ChangeEvent } from "react";
import { Search } from "lucide-react";

interface SearchBarProps {
  onSearch?: (value: string) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState("");

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    // Send search query to parent component
    if (onSearch) onSearch(value);
  };

  return (
    <div className="flex-1">
      <div className="flex items-center gap-3 bg-white rounded-full px-5 py-3 shadow-sm border w-full">
        <Search className="w-4 h-4 opacity-60" />

        <input
          type="text"
          placeholder="Search"
          value={query}
          onChange={handleChange}
          className="w-full outline-none text-sm"
        />
      </div>
    </div>
  );
}
