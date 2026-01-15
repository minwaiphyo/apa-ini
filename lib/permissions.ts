import { UserRole } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from './auth'

export async function requireAuth() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new Error('Unauthorized')
  }
  return session
}

export async function requireRole(role: UserRole) {
  const session = await requireAuth()
  if (session.user.role !== role) {
    throw new Error(`Forbidden: Requires ${role} role`)
  }
  return session
}

export async function requireStaff() {
  return requireRole(UserRole.STAFF)
}

export function hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
  if (requiredRole === UserRole.STAFF) {
    return userRole === UserRole.STAFF
  }
  if (requiredRole === UserRole.VOLUNTEER) {
    return userRole === UserRole.VOLUNTEER || userRole === UserRole.STAFF
  }
  return true
}
