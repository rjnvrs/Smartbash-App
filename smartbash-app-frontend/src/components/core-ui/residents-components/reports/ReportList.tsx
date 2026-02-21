'use client'

import { useState, useEffect } from 'react'
import ReportCard from './ReportCard'
import ReportFilters from './ReportFilters'
import { apiFetch } from '@/lib/api'
import { useRouter } from 'next/navigation'

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
  const router = useRouter()
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [activeStatus, setActiveStatus] =
    useState<Report['status'] | 'all'>('all')
  const [activeType, setActiveType] =
    useState<Report['type'] | 'all'>('all')

  useEffect(() => {
    const loadReports = async () => {
      try {
        const res = await apiFetch('/auth/residents/incidents/my/', { method: 'GET' })
        const data = await res.json().catch(() => ({}))
        if (res.status === 401 || res.status === 403) {
          router.replace('/login')
          return
        }
        if (!res.ok) throw new Error(data?.message || 'Failed to load reports')
        const normalized: Report[] = (Array.isArray(data?.reports) ? data.reports : []).map((r: any) => ({
          id: Number(r.id),
          type: r.type === 'flood' ? 'flood' : 'fire',
          status: r.status === 'completed' ? 'completed' : r.status === 'inprogress' ? 'inprogress' : 'waiting',
          description: String(r.description || ''),
          location: String(r.location || ''),
          images: Array.isArray(r.images) ? r.images : [],
          createdAt: Number(r.createdAt || 0),
        }))
        setReports(normalized)
      } catch {
        setReports([])
      } finally {
        setLoading(false)
      }
    }
    void loadReports()
  }, [router])

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
        {loading && <p className="text-center text-gray-500">Loading reports.</p>}
        {filteredReports.map(report => (
          <ReportCard key={report.id} {...report} />
        ))}

        {!loading && filteredReports.length === 0 && (
          <p className="text-center text-gray-500">
            No reports found.
          </p>
        )}
      </div>
    </div>
  )
}
