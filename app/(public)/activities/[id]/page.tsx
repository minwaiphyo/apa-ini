import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { format } from 'date-fns'
import { CapacityPill } from '@/components/CapacityPill'
import { RegistrationForm } from '@/components/RegistrationForm'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export default async function ActivityDetailPage({ params }: { params: { id: string } }) {
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
      },
      assignments: {
        where: {
          status: {
            in: ['CONFIRMED', 'PENDING'],
          },
        },
      },
      formTemplate: {
        include: {
          fields: {
            orderBy: {
              order: 'asc',
            },
          },
        },
      },
    },
  })

  if (!activity) {
    notFound()
  }

  const session = await getServerSession(authOptions)
  const currentUserRegistration = session
    ? await prisma.registration.findUnique({
        where: {
          activityId_participantId: {
            activityId: activity.id,
            participantId: session.user.id,
          },
        },
      })
    : null

  const currentUserAssignment = session
    ? await prisma.volunteerAssignment.findUnique({
        where: {
          activityId_volunteerId: {
            activityId: activity.id,
            volunteerId: session.user.id,
          },
        },
      })
    : null

  const capacity = activity.registrations.length
  const volunteerCount = activity.assignments.length
  const requiredVolunteers = Math.max(
    activity.volunteerRequired,
    Math.ceil(capacity / activity.volunteerRatio)
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{activity.title}</h1>
              <p className="text-lg text-gray-600 mb-4">{activity.programme.name}</p>
            </div>
            <CapacityPill current={capacity} capacity={activity.capacity} />
          </div>

          {activity.description && (
            <div className="mb-6">
              <p className="text-gray-700 whitespace-pre-wrap">{activity.description}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Date & Time</h3>
              <p className="text-gray-600">
                {format(new Date(activity.startsAt), 'EEEE, MMMM d, yyyy')}
              </p>
              <p className="text-gray-600">
                {format(new Date(activity.startsAt), 'h:mm a')} -{' '}
                {format(new Date(activity.endsAt), 'h:mm a')}
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Location</h3>
              <p className="text-gray-600">{activity.location}</p>
            </div>
          </div>

          {(activity.accessibilityTags.length > 0 || activity.tags.length > 0) && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {activity.accessibilityTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                  >
                    {tag}
                  </span>
                ))}
                {activity.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Capacity & Volunteers</h3>
            <p className="text-sm text-gray-600">
              <strong>Participants:</strong> {capacity}/{activity.capacity}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Volunteers:</strong> {volunteerCount}/{requiredVolunteers} required
              {volunteerCount < requiredVolunteers && (
                <span className="text-yellow-600 ml-2">⚠ Low coverage</span>
              )}
            </p>
          </div>

          {session && (
            <div className="border-t border-gray-200 pt-6">
              {currentUserRegistration ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800 font-medium">
                    ✓ You are registered for this activity
                  </p>
                </div>
              ) : currentUserAssignment ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-800 font-medium">
                    ✓ You are assigned as a volunteer for this activity
                  </p>
                </div>
              ) : (
                <RegistrationForm
                  activity={activity}
                  formTemplate={activity.formTemplate}
                  userId={session.user.id}
                  userRole={session.user.role}
                />
              )}
            </div>
          )}

          {!session && (
            <div className="border-t border-gray-200 pt-6">
              <p className="text-gray-600 mb-4">
                Please <a href="/login" className="text-blue-600 hover:underline">login</a> to register
                for this activity.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
