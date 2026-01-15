'use client'

interface CapacityPillProps {
  current: number
  capacity: number
  className?: string
}

export function CapacityPill({ current, capacity, className = '' }: CapacityPillProps) {
  const percentage = (current / capacity) * 100
  const isFull = current >= capacity
  const isNearFull = percentage >= 80

  const getColor = () => {
    if (isFull) return 'bg-red-100 text-red-800 border-red-300'
    if (isNearFull) return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    return 'bg-green-100 text-green-800 border-green-300'
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getColor()} ${className}`}
    >
      {current}/{capacity} {isFull ? 'FULL' : 'spots'}
    </span>
  )
}
