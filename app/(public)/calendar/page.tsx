import { prisma } from '@/lib/prisma'
import { CalendarShell } from '@/components/CalendarShell'

export default async function CalendarPage() {
  const activities = await prisma.activity.findMany({
    include: {
      programme: true,
      registrations: {
        where: {
          status: {
            in: ['CONFIRMED', 'PENDING'],
          },
        },
      },
    },
    orderBy: {
      startsAt: 'asc',
    },
  })

  const programmes = await prisma.programme.findMany({
    orderBy: {
      name: 'asc',
    },
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Activity Calendar</h1>
        <CalendarShell
          activities={activities.map((a) => ({
            ...a,
            startsAt: a.startsAt,
            endsAt: a.endsAt,
          }))}
          programmes={programmes}
        />
      </div>
    </div>
  )
}
