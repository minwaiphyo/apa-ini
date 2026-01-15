'use client'

import { useState } from 'react'
import { MembershipTier } from '@prisma/client'
import { useRouter } from 'next/navigation'

interface MembershipTierSelectorProps {
  userId: string
  currentTier: MembershipTier
}

export function MembershipTierSelector({ userId, currentTier }: MembershipTierSelectorProps) {
  const router = useRouter()
  const [tier, setTier] = useState(currentTier)
  const [isUpdating, setIsUpdating] = useState(false)

  const handleChange = async (newTier: MembershipTier) => {
    setIsUpdating(true)
    try {
      const response = await fetch('/api/profile/membership-tier', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tier: newTier }),
      })

      if (response.ok) {
        setTier(newTier)
        router.refresh()
      }
    } catch (error) {
      console.error('Failed to update membership tier:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Membership Tier
      </label>
      <select
        value={tier}
        onChange={(e) => handleChange(e.target.value as MembershipTier)}
        disabled={isUpdating}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="AD_HOC">Ad-hoc</option>
        <option value="ONE_PER_WEEK">1x per week</option>
        <option value="TWO_PER_WEEK">2x per week</option>
        <option value="THREE_PLUS_PER_WEEK">3+ per week</option>
      </select>
    </div>
  )
}
