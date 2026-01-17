// Prisma enum types (defined manually to avoid dependency on Prisma client generation)
export type UserRole = 'PARTICIPANT' | 'VOLUNTEER' | 'STAFF'
export type MembershipTier = 'AD_HOC' | 'ONE_PER_WEEK' | 'TWO_PER_WEEK' | 'THREE_PLUS_PER_WEEK'

/**
 * Profile form data structure used across all user roles
 * (Participant, Volunteer, Staff)
 */
export type ProfileForm = {
  user: {
    email: string
    role: UserRole
  }
  profile: {
    name: string
    phone?: string
    membershipTier: MembershipTier
    accessibilityNeeds: string[]

    // Caregiver information
    caregiverPhone?: string

    // Medical information
    medicalStatus?: string // short status
    medicalHistory?: string // longer notes/history

    // Emergency contact
    emergencyContactName?: string
    emergencyContactPhone?: string
    emergencyNotes?: string

    // Skills and interests (used by volunteers, but available for all)
    skills: string[]
    interests: string[]
  }
}
