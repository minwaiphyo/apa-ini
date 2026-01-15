import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { format } from 'date-fns'

export default async function AttendancePage({
  searchParams,
}: {
  searchParams: { activityId?: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'STAFF') {
    redirect('/login')
  }

  if (!searchParams.activityId) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-gray-600">Please select an activity to view the roster.</p>
      </div>
    )
  }

  const activity = await prisma.activity.findUnique({
    where: { id: searchParams.activityId },
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
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-gray-600">Activity not found.</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Activity Roster</h1>
        <h2 className="text-xl text-gray-600 mt-2">{activity.title}</h2>
        <p className="text-gray-500">
          {format(new Date(activity.startsAt), 'EEEE, MMMM d, yyyy')} • {activity.location}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Participants */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Participants ({activity.registrations.length}/{activity.capacity})
          </h3>
          {activity.registrations.length === 0 ? (
            <p className="text-gray-500">No registrations yet.</p>
          ) : (
            <div className="space-y-3">
              {activity.registrations.map((registration) => (
                <div key={registration.id} className="border-b border-gray-200 pb-3 last:border-0">
                  <div className="font-medium text-gray-900">
                    {registration.participant.profile?.name || registration.participant.email}
                  </div>
                  <div className="text-sm text-gray-500">{registration.participant.email}</div>
                  {registration.answers.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {registration.answers.map((answer) => (
                        <div key={answer.id} className="text-xs text-gray-600">
                          <span className="font-medium">{answer.field.label}:</span>{' '}
                          {JSON.parse(answer.valueJson)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Volunteers */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Volunteers ({activity.assignments.length}/{Math.max(
              activity.volunteerRequired,
              Math.ceil(activity.registrations.length / activity.volunteerRatio)
            )})
          </h3>
          {activity.assignments.length === 0 ? (
            <p className="text-gray-500">No volunteers assigned yet.</p>
          ) : (
            <div className="space-y-3">
              {activity.assignments.map((assignment) => (
                <div key={assignment.id} className="border-b border-gray-200 pb-3 last:border-0">
                  <div className="font-medium text-gray-900">
                    {assignment.volunteer.profile?.name || assignment.volunteer.email}
                  </div>
                  <div className="text-sm text-gray-500">{assignment.volunteer.email}</div>
                  {assignment.volunteer.profile?.skills && assignment.volunteer.profile.skills.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {assignment.volunteer.profile.skills.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6">
        <a
          href={`/api/export/activity/${activity.id}/csv`}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Export CSV
        </a>
      </div>
    </div>
  )
}
