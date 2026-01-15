'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay } from 'date-fns'
import { ActivityCard } from './ActivityCard'

interface Activity {
  id: string
  title: string
  startsAt: Date
  endsAt: Date
  location: string
  programme: {
    id: string
    name: string
  }
  capacity: number
  registrations: Array<{ id: string }>
  accessibilityTags: string[]
  tags: string[]
}

interface CalendarShellProps {
  activities: Activity[]
  programmes?: Array<{ id: string; name: string }>
  onFilterChange?: (filters: {
    programmeId?: string
    accessibilityTag?: string
    tag?: string
  }) => void
}

export function CalendarShell({ activities, programmes = [], onFilterChange }: CalendarShellProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [viewMode, setViewMode] = useState<'month' | 'list'>('month')
  const [filters, setFilters] = useState<{
    programmeId?: string
    accessibilityTag?: string
    tag?: string
  }>({})

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const filteredActivities = useMemo(() => {
    return activities.filter((activity) => {
      if (filters.programmeId && activity.programme.id !== filters.programmeId) {
        return false
      }
      if (filters.accessibilityTag && !activity.accessibilityTags.includes(filters.accessibilityTag)) {
        return false
      }
      if (filters.tag && !activity.tags.includes(filters.tag)) {
        return false
      }
      return true
    })
  }, [activities, filters])

  const activitiesByDate = useMemo(() => {
    const map = new Map<string, Activity[]>()
    filteredActivities.forEach((activity) => {
      const dateKey = format(new Date(activity.startsAt), 'yyyy-MM-dd')
      if (!map.has(dateKey)) {
        map.set(dateKey, [])
      }
      map.get(dateKey)!.push(activity)
    })
    return map
  }, [filteredActivities])

  const allAccessibilityTags = useMemo(() => {
    const tags = new Set<string>()
    activities.forEach((activity) => {
      activity.accessibilityTags.forEach((tag) => tags.add(tag))
    })
    return Array.from(tags)
  }, [activities])

  const allTags = useMemo(() => {
    const tags = new Set<string>()
    activities.forEach((activity) => {
      activity.tags.forEach((tag) => tags.add(tag))
    })
    return Array.from(tags)
  }, [activities])

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters)
    onFilterChange?.(newFilters)
  }

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  if (viewMode === 'list') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Activities</h2>
          <button
            onClick={() => setViewMode('month')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Switch to Calendar
          </button>
        </div>
        <div className="space-y-4">
          {filteredActivities.map((activity) => (
            <ActivityCard
              key={activity.id}
              id={activity.id}
              title={activity.title}
              startsAt={new Date(activity.startsAt)}
              endsAt={new Date(activity.endsAt)}
              location={activity.location}
              programme={activity.programme}
              capacity={activity.capacity}
              currentRegistrations={activity.registrations.length}
              accessibilityTags={activity.accessibilityTags}
              tags={activity.tags}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {programmes.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Programme</label>
              <select
                value={filters.programmeId || ''}
                onChange={(e) =>
                  handleFilterChange({ ...filters, programmeId: e.target.value || undefined })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Programmes</option>
                {programmes.map((programme) => (
                  <option key={programme.id} value={programme.id}>
                    {programme.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {allAccessibilityTags.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Accessibility</label>
              <select
                value={filters.accessibilityTag || ''}
                onChange={(e) =>
                  handleFilterChange({ ...filters, accessibilityTag: e.target.value || undefined })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All</option>
                {allAccessibilityTags.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </div>
          )}

          {allTags.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Activity Type</label>
              <select
                value={filters.tag || ''}
                onChange={(e) => handleFilterChange({ ...filters, tag: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                {allTags.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">{format(currentMonth, 'MMMM yyyy')}</h2>
        <div className="flex gap-2">
          <button
            onClick={previousMonth}
            className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200"
          >
            Previous
          </button>
          <button
            onClick={() => setCurrentMonth(new Date())}
            className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200"
          >
            Today
          </button>
          <button
            onClick={nextMonth}
            className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200"
          >
            Next
          </button>
          <button
            onClick={() => setViewMode('list')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            List View
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="bg-gray-50 p-2 text-center text-sm font-medium text-gray-700">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {daysInMonth.map((day) => {
            const dateKey = format(day, 'yyyy-MM-dd')
            const dayActivities = activitiesByDate.get(dateKey) || []
            const isCurrentMonth = isSameMonth(day, currentMonth)
            const isCurrentDay = isToday(day)

            return (
              <div
                key={day.toISOString()}
                className={`min-h-24 bg-white p-2 ${!isCurrentMonth ? 'bg-gray-50' : ''}`}
              >
                <div
                  className={`text-sm font-medium mb-1 ${
                    isCurrentDay
                      ? 'bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center'
                      : isCurrentMonth
                      ? 'text-gray-900'
                      : 'text-gray-400'
                  }`}
                >
                  {format(day, 'd')}
                </div>
                <div className="space-y-1">
                  {dayActivities.slice(0, 2).map((activity) => (
                    <Link
                      key={activity.id}
                      href={`/activities/${activity.id}`}
                      className="block text-xs bg-blue-100 text-blue-800 rounded px-1 py-0.5 truncate hover:bg-blue-200"
                      title={activity.title}
                    >
                      {format(new Date(activity.startsAt), 'h:mm a')} {activity.title}
                    </Link>
                  ))}
                  {dayActivities.length > 2 && (
                    <div className="text-xs text-gray-500">+{dayActivities.length - 2} more</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
