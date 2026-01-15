'use client'

import { signOut } from 'next-auth/react'

export function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/' })}
      className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
    >
      Logout
    </button>
  )
}
