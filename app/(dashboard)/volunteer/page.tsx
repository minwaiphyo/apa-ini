import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { ActivityCard } from '@/components/ActivityCard'

export default async function VolunteerDashboard() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'VOLUNTEER') {
    redirect('/login')
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
  })

  const myAssignments = await prisma.volunteerAssignment.findMany({
    where: {
      volunteerId: session.user.id,
      status: {
        in: ['CONFIRMED', 'PENDING'],
      },
    },
    include: {
      activity: {
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
      },
    },
    orderBy: {
      activity: {
        startsAt: 'asc',
      },
    },
  })

  // Get available activities
  const now = new Date()
  const availableActivities = await prisma.activity.findMany({
    where: {
      startsAt: {
        gte: now,
      },
      assignments: {
        none: {
          volunteerId: session.user.id,
        },
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Volunteer Dashboard</h1>
        <p className="mt-2 text-gray-600">Welcome back, {profile?.name || session.user.email}!</p>
      </div>

      {profile && profile.skills.length > 0 && (
        <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Skills & Interests</h3>
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
              >
                {skill}
              </span>
            ))}
            {profile.interests.map((interest) => (
              <span
                key={interest}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">My Commitments</h2>
        {myAssignments.length === 0 ? (
          <p className="text-gray-600">You haven't signed up for any activities yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myAssignments.map((assignment) => {
              const requiredVolunteers = Math.max(
                assignment.activity.volunteerRequired,
                Math.ceil(
                  assignment.activity.registrations.length / assignment.activity.volunteerRatio
                )
              )
              const currentVolunteers = assignment.activity.assignments.length

              return (
                <div key={assignment.id}>
                  <ActivityCard
                    id={assignment.activity.id}
                    title={assignment.activity.title}
                    startsAt={assignment.activity.startsAt}
                    endsAt={assignment.activity.endsAt}
                    location={assignment.activity.location}
                    programme={assignment.activity.programme}
                    capacity={assignment.activity.capacity}
                    currentRegistrations={assignment.activity.registrations.length}
                    accessibilityTags={assignment.activity.accessibilityTags}
                    tags={assignment.activity.tags}
                  />
                  <div className="mt-2 text-sm text-gray-600">
                    Volunteers: {currentVolunteers}/{requiredVolunteers}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Available Activities</h2>
        {availableActivities.length === 0 ? (
          <p className="text-gray-600">No upcoming activities available.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableActivities.map((activity) => {
              const requiredVolunteers = Math.max(
                activity.volunteerRequired,
                Math.ceil(activity.registrations.length / activity.volunteerRatio)
              )
              const currentVolunteers = activity.assignments.length
              const needsVolunteers = currentVolunteers < requiredVolunteers

              return (
                <div key={activity.id}>
                  <ActivityCard
                    id={activity.id}
                    title={activity.title}
                    startsAt={activity.startsAt}
                    endsAt={activity.endsAt}
                    location={activity.location}
                    programme={activity.programme}
                    capacity={activity.capacity}
                    currentRegistrations={activity.registrations.length}
                    accessibilityTags={activity.accessibilityTags}
                    tags={activity.tags}
                  />
                  <div className="mt-2 text-sm">
                    {needsVolunteers ? (
                      <span className="text-yellow-600 font-medium">
                        ⚠ Needs volunteers: {currentVolunteers}/{requiredVolunteers}
                      </span>
                    ) : (
                      <span className="text-gray-600">
                        Volunteers: {currentVolunteers}/{requiredVolunteers}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
