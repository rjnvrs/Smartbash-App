'use client'

import { Flame, Waves } from 'lucide-react'
import Image from 'next/image'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardAction,
} from '@/components/ui/card'

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
}: ReportCardProps) {
  const statusLabel = {
    completed: 'Completed',
    waiting: 'Waiting',
    inprogress: 'In progress',
  }[status]

  const statusDotColor = {
    waiting: 'bg-red-500',
    inprogress: 'bg-orange-500',
    completed: 'bg-green-500',
  }[status]

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-gray-100">
            {type === 'fire' && <Flame className="text-red-500" />}
            {type === 'flood' && <Waves className="text-blue-500" />}
          </div>
          <CardTitle className="capitalize">
            {type} Incident
          </CardTitle>
        </div>

        <CardAction>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>{statusLabel}</span>
            <span className={`w-2 h-2 rounded-full ${statusDotColor}`} />
          </div>
        </CardAction>
      </CardHeader>

      <CardContent>
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-600 mb-1">
            Incident Description
          </p>
          <div className="bg-gray-50 border rounded p-3 text-sm">
            {description}
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm font-medium text-gray-600 mb-1">
            Location
          </p>
          <div className="bg-gray-50 border rounded p-3 text-sm">
            {location}
          </div>
        </div>

        {images.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-600 mb-2">
              Images
            </p>
            <div className="flex gap-3">
              {images.map((img, i) => (
                <div
                  key={i}
                  className="relative w-28 h-20 rounded overflow-hidden"
                >
                  <Image
                    src={img}
                    alt="incident"
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
