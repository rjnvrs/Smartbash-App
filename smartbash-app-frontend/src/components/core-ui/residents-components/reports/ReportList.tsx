'use client'

import { useState, useEffect } from 'react'
import ReportCard from './ReportCard'
import ReportFilters from './ReportFilters'

interface Report {
  id: number
  type: 'fire' | 'flood'
  status: 'completed' | 'waiting' | 'inprogress'
  description: string
  location: string
  images?: string[]
  createdAt: number
}

export default function ReportList() {
  const [reports, setReports] = useState<Report[]>([])
  const [activeStatus, setActiveStatus] =
    useState<Report['status'] | 'all'>('all')
  const [activeType, setActiveType] =
    useState<Report['type'] | 'all'>('all')

  // 🔗 CONNECT TO IncidentForm STORAGE
  useEffect(() => {
    const storedReports = JSON.parse(
      localStorage.getItem('incident_reports') || '[]'
    )
    setReports(storedReports)
  }, [])

  const filteredReports = reports.filter(report => {
    const statusMatch =
      activeStatus === 'all' || report.status === activeStatus

    const typeMatch =
      activeType === 'all' || report.type === activeType

    return statusMatch && typeMatch
  })

  return (
    <div className="max-w-5xl mx-auto p-6">
      <ReportFilters
        activeStatus={activeStatus}
        onStatusChange={setActiveStatus}
        activeType={activeType}
        onTypeChange={setActiveType}
      />

      <div className="space-y-6">
        {filteredReports.map(report => (
          <ReportCard key={report.id} {...report} />
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
