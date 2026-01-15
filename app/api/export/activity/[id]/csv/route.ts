import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { requireStaff } from '@/lib/permissions'
import { format } from 'date-fns'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireStaff()

    const activity = await prisma.activity.findUnique({
      where: { id: params.id },
      include: {
        programme: true,
        registrations: {
          where: {
            status: {
              in: ['CONFIRMED', 'PENDING'],
            },
          },
          include: {
            participant: {
              include: {
                profile: true,
              },
            },
            answers: {
              include: {
                field: true,
              },
            },
          },
        },
        assignments: {
          where: {
            status: {
              in: ['CONFIRMED', 'PENDING'],
            },
          },
          include: {
            volunteer: {
              include: {
                profile: true,
              },
            },
          },
        },
      },
    })

    if (!activity) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 })
    }

    // Generate CSV
    const csvRows: string[] = []

    // Header
    csvRows.push(`Activity: ${activity.title}`)
    csvRows.push(`Programme: ${activity.programme.name}`)
    csvRows.push(`Date: ${format(new Date(activity.startsAt), 'yyyy-MM-dd')}`)
    csvRows.push(`Time: ${format(new Date(activity.startsAt), 'HH:mm')} - ${format(new Date(activity.endsAt), 'HH:mm')}`)
    csvRows.push(`Location: ${activity.location}`)
    csvRows.push('')

    // Participants
    csvRows.push('PARTICIPANTS')
    csvRows.push('Name,Email,Phone,Registration Date')
    activity.registrations.forEach((reg) => {
      const name = reg.participant.profile?.name || ''
      const email = reg.participant.email
      const phone = reg.participant.profile?.phone || ''
      const date = format(new Date(reg.createdAt), 'yyyy-MM-dd HH:mm')
      csvRows.push(`"${name}","${email}","${phone}","${date}"`)
    })
    csvRows.push('')

    // Volunteers
    csvRows.push('VOLUNTEERS')
    csvRows.push('Name,Email,Phone')
    activity.assignments.forEach((assignment) => {
      const name = assignment.volunteer.profile?.name || ''
      const email = assignment.volunteer.email
      const phone = assignment.volunteer.profile?.phone || ''
      csvRows.push(`"${name}","${email}","${phone}"`)
    })

    const csv = csvRows.join('\n')

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="activity-${activity.id}-roster.csv"`,
      },
    })
  } catch (error: any) {
    console.error('Export CSV error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
