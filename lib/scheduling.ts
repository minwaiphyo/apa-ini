import { prisma } from './prisma'
import { sendStaffAlert } from './mailer'

export interface ConflictCheck {
  hasConflict: boolean
  conflictingActivity?: {
    id: string
    title: string
    startsAt: Date
    endsAt: Date
  }
}

export async function checkTimeConflict(
  userId: string,
  activityId: string,
  startsAt: Date,
  endsAt: Date
): Promise<ConflictCheck> {
  // Check participant registrations
  const participantRegistrations = await prisma.registration.findMany({
    where: {
      participantId: userId,
      status: {
        in: ['CONFIRMED', 'PENDING'],
      },
      activity: {
        id: {
          not: activityId,
        },
        startsAt: {
          lt: endsAt,
        },
        endsAt: {
          gt: startsAt,
        },
      },
    },
    include: {
      activity: true,
    },
  })

  if (participantRegistrations.length > 0) {
    const conflict = participantRegistrations[0]
    return {
      hasConflict: true,
      conflictingActivity: {
        id: conflict.activity.id,
        title: conflict.activity.title,
        startsAt: conflict.activity.startsAt,
        endsAt: conflict.activity.endsAt,
      },
    }
  }

  // Check volunteer assignments
  const volunteerAssignments = await prisma.volunteerAssignment.findMany({
    where: {
      volunteerId: userId,
      status: {
        in: ['CONFIRMED', 'PENDING'],
      },
      activity: {
        id: {
          not: activityId,
        },
        startsAt: {
          lt: endsAt,
        },
        endsAt: {
          gt: startsAt,
        },
      },
    },
    include: {
      activity: true,
    },
  })

  if (volunteerAssignments.length > 0) {
    const conflict = volunteerAssignments[0]
    return {
      hasConflict: true,
      conflictingActivity: {
        id: conflict.activity.id,
        title: conflict.activity.title,
        startsAt: conflict.activity.startsAt,
        endsAt: conflict.activity.endsAt,
      },
    }
  }

  return { hasConflict: false }
}

export async function checkCapacity(activityId: string): Promise<{
  isFull: boolean
  currentCount: number
  capacity: number
  percentage: number
}> {
  const activity = await prisma.activity.findUnique({
    where: { id: activityId },
    include: {
      registrations: {
        where: {
          status: {
            in: ['CONFIRMED', 'PENDING'],
          },
        },
      },
    },
  })

  if (!activity) {
    throw new Error('Activity not found')
  }

  const currentCount = activity.registrations.length
  const percentage = (currentCount / activity.capacity) * 100

  return {
    isFull: currentCount >= activity.capacity,
    currentCount,
    capacity: activity.capacity,
    percentage,
  }
}

export async function checkVolunteerCoverage(activityId: string): Promise<{
  isSufficient: boolean
  currentVolunteers: number
  requiredVolunteers: number
  participantCount: number
  ratio: number
}> {
  const activity = await prisma.activity.findUnique({
    where: { id: activityId },
    include: {
      registrations: {
        where: {
          status: {
            in: ['CONFIRMED', 'PENDING'],
          },
        },
      },
      assignments: {
        where: {
          status: {
            in: ['CONFIRMED', 'PENDING'],
          },
        },
      },
    },
  })

  if (!activity) {
    throw new Error('Activity not found')
  }

  const participantCount = activity.registrations.length
  const currentVolunteers = activity.assignments.length
  const requiredVolunteers = Math.max(
    activity.volunteerRequired,
    Math.ceil(participantCount / activity.volunteerRatio)
  )

  return {
    isSufficient: currentVolunteers >= requiredVolunteers,
    currentVolunteers,
    requiredVolunteers,
    participantCount,
    ratio: activity.volunteerRatio,
  }
}

export async function checkAndAlertCapacity(activityId: string) {
  const capacity = await checkCapacity(activityId)
  const activity = await prisma.activity.findUnique({
    where: { id: activityId },
  })

  if (!activity) return

  // Alert at 80% capacity
  if (capacity.percentage >= 80 && capacity.percentage < 100) {
    const staffEmails = await prisma.user.findMany({
      where: { role: 'STAFF' },
      select: { email: true },
    })

    if (staffEmails.length > 0) {
      await sendStaffAlert({
        to: staffEmails.map((u) => u.email),
        subject: `Activity ${activity.title} at ${capacity.percentage.toFixed(0)}% capacity`,
        message: `Activity "${activity.title}" has reached ${capacity.currentCount}/${capacity.capacity} registrations (${capacity.percentage.toFixed(0)}%).`,
      })
    }
  }

  // Alert when full
  if (capacity.isFull) {
    const staffEmails = await prisma.user.findMany({
      where: { role: 'STAFF' },
      select: { email: true },
    })

    if (staffEmails.length > 0) {
      await sendStaffAlert({
        to: staffEmails.map((u) => u.email),
        subject: `Activity ${activity.title} is FULL`,
        message: `Activity "${activity.title}" has reached full capacity (${capacity.capacity} registrations).`,
      })
    }
  }
}

export async function checkAndAlertVolunteerCoverage(activityId: string) {
  const coverage = await checkVolunteerCoverage(activityId)
  const activity = await prisma.activity.findUnique({
    where: { id: activityId },
  })

  if (!activity) return

  if (!coverage.isSufficient) {
    const staffEmails = await prisma.user.findMany({
      where: { role: 'STAFF' },
      select: { email: true },
    })

    if (staffEmails.length > 0) {
      await sendStaffAlert({
        to: staffEmails.map((u) => u.email),
        subject: `Low volunteer coverage for ${activity.title}`,
        message: `Activity "${activity.title}" has ${coverage.currentVolunteers}/${coverage.requiredVolunteers} volunteers (${coverage.participantCount} participants, ratio: ${coverage.ratio}:1).`,
      })
    }
  }
}
