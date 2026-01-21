'use client'

import Image from 'next/image'

interface ReportCardProps {
  type: 'fire' | 'flood'
  status: 'completed' | 'waiting' | 'inprogress'
  description: string
  location: string
  images?: string[]
}

export default function ReportCard({
  type,
  status,
  description,
  location,
  images = [],
}: ReportCardProps){
  const statusLabel: Record<ReportCardProps['status'], string> = {
    completed: 'Completed',
    waiting: 'Waiting',
    inprogress: 'In progress',
  }

  // Map status to dot colors
  const statusDotColor: Record<ReportCardProps['status'], string> = {
    waiting: 'bg-red-500',
    inprogress: 'bg-orange-500',
    completed: 'bg-green-500',
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
        <div className="w-12 h-12 relative">
          {type === 'fire' && (
            <img
              src="/RecentReport_icons/Fire_icons.png"
              alt="Fire Icon"
              className="w-9 h-9 object-contain"
            />
          )}
          {type === 'flood' && (
            <img
              src="/RecentReport_icons/Flood_icons.png"
              alt="Flood Icon"
              className="w-9 h-9 object-contain"
            />
          )}
        </div>

          <h2 className="font-semibold text-gray-800 capitalize">
            {type} Incident
          </h2>
        </div>

        {/* Status */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>{statusLabel[status]}</span>
          <span
            className={`w-2 h-2 rounded-full ${statusDotColor[status]}`}
          />
        </div>
      </div>

      {/* Incident Description */}
      <div className="mb-4">
        <p className="text-sm font-medium text-gray-600 mb-1">
          Incident Description
        </p>
        <div className="bg-gray-50 border border-gray-200 rounded-md p-3 text-sm text-gray-700">
          {description}
        </div>
      </div>

      {/* Location */}
      <div className="mb-4">
        <p className="text-sm font-medium text-gray-600 mb-1">Location</p>
        <div className="bg-gray-50 border border-gray-200 rounded-md p-3 text-sm text-gray-700">
          {location}
        </div>
      </div>

      {/* Images */}
      {images.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-600 mb-2">Images</p>
          <div className="flex gap-3">
            {images.map((img, i) => (
              <div
                key={i}
                className="relative w-28 h-20 rounded-md overflow-hidden"
              >
                <Image
                  src={img}
                  alt="incident image"
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
