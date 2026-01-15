'use client'

import { useSession } from 'next-auth/react'
import { UserRole } from '@prisma/client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface RoleGateProps {
  children: React.ReactNode
  allowedRoles: UserRole[]
  fallback?: React.ReactNode
}

export function RoleGate({ children, allowedRoles, fallback }: RoleGateProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!session || !allowedRoles.includes(session.user.role)) {
    return fallback || <div className="flex items-center justify-center min-h-screen">Access Denied</div>
  }

  return <>{children}</>
}
