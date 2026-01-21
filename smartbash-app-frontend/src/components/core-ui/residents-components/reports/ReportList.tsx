'use client'

import { useState } from 'react'
import ReportCard from './ReportCard'
import ReportFilters from './ReportFilters'

interface Report {
  type: 'fire' | 'flood'
  status: 'completed' | 'waiting' | 'inprogress'
  description: string
  location: string
  images?: string[]
}

const mockReports: Report[] = [
  {
    type: 'fire',
    status: 'completed',
    description: 'Navy sunog nga nakita sa likod sa residential area...',
    location: 'Laguna Basak Pardo, Cebu City',
    images: ['/logo.png', '/logo.png', '/logo.png'],
  },
  {
    type: 'flood',
    status: 'waiting',
    description: 'Nagsugod ang baha paggabie...',
    location: 'Purok 3, Brgy. Mabini, Davao City',
    images: ['/logo.png'],
  },
   {
    type: 'fire',
    status: 'inprogress',
    description: 'Nagsugod ang baha paggabie...',
    location: 'Purok 3, Brgy. Mabini, Davao City',
    images: ['/logo.png'],
  },
   {
    type: 'flood',
    status: 'completed',
    description: 'Navy sunog nga nakita sa likod sa residential area...',
    location: 'Laguna Basak Pardo, Cebu City',
    images: ['/logo.png', '/logo.png', '/logo.png'],
  },
]

export default function ReportList() {
  const [activeStatus, setActiveStatus] = useState<Report['status'] | 'all'>('all')
  const [activeType, setActiveType] = useState<Report['type'] | 'all'>('all')

  const filteredReports = mockReports.filter(report => {
    const statusMatch =
      activeStatus === 'all' || report.status === activeStatus

    const typeMatch =
      activeType === 'all' || report.type === activeType

    return statusMatch && typeMatch
  })

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Filters */}
      <ReportFilters
        activeStatus={activeStatus}
        onStatusChange={setActiveStatus}
        activeType={activeType}
        onTypeChange={setActiveType}
      />

      {/* Report Cards */}
      <div className="space-y-6">
        {filteredReports.map((report, index) => (
          <ReportCard key={index} {...report} />
        ))}

        {filteredReports.length === 0 && (
          <p className="text-center text-gray-500">
            No reports found.
          </p>
        )}
      </div>
    </div>
  )
}
