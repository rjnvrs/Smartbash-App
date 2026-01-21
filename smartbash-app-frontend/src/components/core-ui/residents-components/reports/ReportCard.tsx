'use client'

import { Flame, Waves } from 'lucide-react'
import Image from 'next/image'

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardAction,
} from "@/components/ui/card"

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
  const statusLabel: Record<ReportCardProps['status'], string> = {
    completed: 'Completed',
    waiting: 'Waiting',
    inprogress: 'In progress',
  }

  const statusDotColor: Record<ReportCardProps['status'], string> = {
    waiting: 'bg-red-500',
    inprogress: 'bg-orange-500',
    completed: 'bg-green-500',
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-gray-100">
            {type === 'fire' && <Flame className="w-7 h-7 text-red-500" />}
            {type === 'flood' && <Waves className="w-7 h-7 text-blue-500" />}
          </div>

          <CardTitle className="capitalize">
            {type} Incident
          </CardTitle>
        </div>

        <CardAction>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>{statusLabel[status]}</span>
            <span className={`w-2 h-2 rounded-full ${statusDotColor[status]}`} />
          </div>
        </CardAction>
      </CardHeader>

      <CardContent>
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-600 mb-1">
            Incident Description
          </p>
          <div className="bg-gray-50 border border-gray-200 rounded-md p-3 text-sm text-gray-700">
            {description}
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm font-medium text-gray-600 mb-1">Location</p>
          <div className="bg-gray-50 border border-gray-200 rounded-md p-3 text-sm text-gray-700">
            {location}
          </div>
        </div>

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
      </CardContent>
    </Card>
  )
}
