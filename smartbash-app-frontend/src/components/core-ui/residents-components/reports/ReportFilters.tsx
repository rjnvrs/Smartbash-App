'use client'

import { useState, useRef, useEffect } from 'react'

interface ReportFiltersProps {
  activeStatus: 'all' | 'waiting' | 'inprogress' | 'completed'
  onStatusChange: (status: 'all' | 'waiting' | 'inprogress' | 'completed') => void
  activeType: 'all' | 'fire' | 'flood'
  onTypeChange: (type: 'all' | 'fire' | 'flood') => void
}

export default function ReportFilters({
  activeStatus,
  onStatusChange,
  activeType,
  onTypeChange,
}: ReportFiltersProps) {
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const statusTabs = [
    { key: 'all', label: 'All' },
    { key: 'waiting', label: 'Waiting' },
    { key: 'inprogress', label: 'In progress' },
    { key: 'completed', label: 'Completed' },
  ] as const;

  const typeOptions = [
    { key: 'all', label: 'All Types' },
    { key: 'fire', label: '🔥 Fire' },
    { key: 'flood', label: '💧 Flood' },
  ] as const;

  // Status color map
  const statusColors: Record<ReportFiltersProps['activeStatus'], string> = {
    all: 'text-gray-700 bg-white',
    waiting: 'text-red-600 bg-red-50',
    inprogress: 'text-orange-600 bg-orange-50',
    completed: 'text-green-600 bg-green-50',
  }

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="flex items-center justify-between mb-6 relative">
      {/* STATUS TABS */}
      <div className="flex gap-2 bg-gray-100 p-1 rounded-full">
        {statusTabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => onStatusChange(tab.key)}
            className={`
              px-4 py-1.5 rounded-full text-sm font-medium transition
              ${
                activeStatus === tab.key
                  ? `${statusColors[tab.key]} shadow`
                  : 'text-gray-500 hover:text-gray-700'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* FILTER DROPDOWN */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setOpen(!open)}
          className="p-2 rounded-md hover:bg-gray-100"
        >
          <svg
            className="w-5 h-5 text-gray-500"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 4h18M6 10h12M10 16h4"
            />
          </svg>
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
            {typeOptions.map(option => (
              <button
                key={option.key}
                onClick={() => {
                  onTypeChange(option.key)
                  setOpen(false)
                }}
                className={`
                  w-full text-left px-4 py-2 text-sm hover:bg-gray-50
                  ${
                    activeType === option.key
                      ? 'font-semibold text-gray-900'
                      : 'text-gray-600'
                  }
                `}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
