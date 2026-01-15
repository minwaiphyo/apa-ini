import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { checkCapacity, checkVolunteerCoverage } from '@/lib/scheduling'

export default async function StaffDashboard() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'STAFF') {
    redirect('/login')
  }

  const now = new Date()
  const upcomingActivities = await prisma.activity.findMany({
    where: {
      startsAt: {
        gte: now,
      },
    },
    include: {
      programme: true,
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
    orderBy: {
      startsAt: 'asc',
    },
    take: 10,
  })

  const activitiesWithAlerts = await Promise.all(
    upcomingActivities.map(async (activity) => {
      const capacity = await checkCapacity(activity.id)
      const coverage = await checkVolunteerCoverage(activity.id)

      return {
        ...activity,
        capacityAlert: capacity.percentage >= 80,
        coverageAlert: !coverage.isSufficient,
      }
    })
  )

  const totalActivities = await prisma.activity.count()
  const totalRegistrations = await prisma.registration.count({
    where: {
      status: {
        in: ['CONFIRMED', 'PENDING'],
      },
    },
  })
  const totalVolunteers = await prisma.volunteerAssignment.count({
    where: {
      status: {
        in: ['CONFIRMED', 'PENDING'],
      },
    },
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Staff Dashboard</h1>
          <p className="mt-2 text-gray-600">Activity management and oversight</p>
        </div>
        <Link
          href="/dashboard/staff/activities/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Create Activity
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Total Activities</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{totalActivities}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Total Registrations</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{totalRegistrations}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Volunteer Assignments</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{totalVolunteers}</p>
        </div>
      </div>

      {/* Upcoming Activities */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-gray-900">Upcoming Activities</h2>
          <Link
            href="/dashboard/staff/activities"
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            View All →
          </Link>
        </div>

        <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Activity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Capacity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Volunteers
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {activitiesWithAlerts.map((activity) => {
                const requiredVolunteers = Math.max(
                  activity.volunteerRequired,
                  Math.ceil(activity.registrations.length / activity.volunteerRatio)
                )

                return (
                  <tr key={activity.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{activity.title}</div>
                      <div className="text-sm text-gray-500">{activity.programme.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {format(new Date(activity.startsAt), 'MMM d, yyyy')}
                      </div>
                      <div className="text-sm text-gray-500">
                        {format(new Date(activity.startsAt), 'h:mm a')} -{' '}
                        {format(new Date(activity.endsAt), 'h:mm a')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {activity.registrations.length}/{activity.capacity}
                      </div>
                      {activity.capacityAlert && (
                        <div className="text-xs text-yellow-600">⚠ Near capacity</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {activity.assignments.length}/{requiredVolunteers}
                      </div>
                      {activity.coverageAlert && (
                        <div className="text-xs text-red-600">⚠ Low coverage</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {activity.capacityAlert || activity.coverageAlert ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Alert
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          OK
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        href={`/dashboard/staff/activities/${activity.id}/edit`}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Edit
                      </Link>
                      <Link
                        href={`/dashboard/staff/attendance?activityId=${activity.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Roster
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
