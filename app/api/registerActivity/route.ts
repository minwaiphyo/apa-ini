import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { checkTimeConflict } from '@/lib/scheduling'
import { checkCapacity, checkAndAlertCapacity, checkAndAlertVolunteerCoverage } from '@/lib/scheduling'
import { sendRegistrationConfirmation } from '@/lib/mailer'
import { UserRole } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { activityId, userId, userRole, answers } = body

    if (userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
    })

    if (!activity) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 })
    }

    // Check capacity
    const capacity = await checkCapacity(activityId)
    if (capacity.isFull && userRole === UserRole.PARTICIPANT) {
      return NextResponse.json({ error: 'Activity is full' }, { status: 400 })
    }

    // Check time conflict
    const conflict = await checkTimeConflict(
      userId,
      activityId,
      activity.startsAt,
      activity.endsAt
    )

    if (conflict.hasConflict) {
      return NextResponse.json(
        {
          error: 'Time conflict detected',
          conflict: conflict.conflictingActivity,
        },
        { status: 400 }
      )
    }

    // Create registration or assignment
    if (userRole === UserRole.PARTICIPANT) {
      const registration = await prisma.registration.create({
        data: {
          activityId,
          participantId: userId,
          status: 'CONFIRMED',
        },
      })

      // Save form answers
      if (answers && Object.keys(answers).length > 0) {
        const formTemplate = await prisma.formTemplate.findUnique({
          where: { activityId },
          include: { fields: true },
        })

        if (formTemplate) {
          const answerEntries = Object.entries(answers)
          await Promise.all(
            answerEntries.map(async ([key, value]) => {
              const field = formTemplate.fields.find((f) => f.key === key)
              if (field) {
                await prisma.registrationAnswer.create({
                  data: {
                    registrationId: registration.id,
                    fieldId: field.id,
                    valueJson: JSON.stringify(value),
                  },
                })
              }
            })
          )
        }
      }

      // Send confirmation email
      const user = await prisma.user.findUnique({
        where: { id: userId },
      })

      if (user?.email) {
        await sendRegistrationConfirmation({
          to: user.email,
          activityTitle: activity.title,
          startsAt: activity.startsAt,
          location: activity.location,
        })
      }

      // Check and alert capacity
      await checkAndAlertCapacity(activityId)

      return NextResponse.json({ success: true, registration })
    } else if (userRole === UserRole.VOLUNTEER) {
      const assignment = await prisma.volunteerAssignment.create({
        data: {
          activityId,
          volunteerId: userId,
          status: 'CONFIRMED',
        },
      })

      // Check volunteer coverage
      await checkAndAlertVolunteerCoverage(activityId)

      return NextResponse.json({ success: true, assignment })
    } else {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }
  } catch (error: any) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
