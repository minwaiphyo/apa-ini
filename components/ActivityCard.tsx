'use client'

import Link from 'next/link'
import { format } from 'date-fns'
import { CapacityPill } from './CapacityPill'

interface ActivityCardProps {
  id: string
  title: string
  startsAt: Date
  endsAt: Date
  location: string
  programme: {
    name: string
  }
  capacity: number
  currentRegistrations: number
  accessibilityTags: string[]
  tags: string[]
}

export function ActivityCard({
  id,
  title,
  startsAt,
  endsAt,
  location,
  programme,
  capacity,
  currentRegistrations,
  accessibilityTags,
  tags,
}: ActivityCardProps) {
  const timeRange = `${format(new Date(startsAt), 'h:mm a')} - ${format(new Date(endsAt), 'h:mm a')}`
  const dateStr = format(new Date(startsAt), 'MMM d, yyyy')

  return (
    <Link
      href={`/activities/${id}`}
      className="block p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
          <p className="text-sm text-gray-600 mb-2">
            <span className="font-medium">{programme.name}</span>
          </p>
        </div>
        <CapacityPill current={currentRegistrations} capacity={capacity} />
      </div>

      <div className="space-y-1 text-sm text-gray-600 mb-3">
        <p>
          <span className="font-medium">Date:</span> {dateStr}
        </p>
        <p>
          <span className="font-medium">Time:</span> {timeRange}
        </p>
        <p>
          <span className="font-medium">Location:</span> {location}
        </p>
      </div>

      {(accessibilityTags.length > 0 || tags.length > 0) && (
        <div className="flex flex-wrap gap-2">
          {accessibilityTags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800"
            >
              {tag}
            </span>
          ))}
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </Link>
  )
}
