"use client";

import { ChangeEvent } from "react";

interface CategoryFilterProps<T extends string> {
  selectedCategory: T;
  onCategoryChange: (value: T) => void;
  options: T[];
}

export default function CategoryFilter<T extends string>({ selectedCategory, onCategoryChange, options }: CategoryFilterProps<T>) {
  return (
    <div className="w-48">
      <select
        value={selectedCategory}
        onChange={(e: ChangeEvent<HTMLSelectElement>) => onCategoryChange(e.target.value as T)}
        className="w-full px-4 py-2.5 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-700"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
