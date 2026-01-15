import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { format } from 'date-fns'
import { ActivityCard } from '@/components/ActivityCard'
import { MembershipTierSelector } from '@/components/MembershipTierSelector'

export default async function ParticipantDashboard() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'PARTICIPANT') {
    redirect('/login')
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
  })

  const myRegistrations = await prisma.registration.findMany({
    where: {
      participantId: session.user.id,
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
        },
      },
    },
    orderBy: {
      activity: {
        startsAt: 'asc',
      },
    },
  })

  // Get eligible activities based on membership tier
  const now = new Date()
  const eligibleActivities = await prisma.activity.findMany({
    where: {
      startsAt: {
        gte: now,
      },
      registrations: {
        none: {
          participantId: session.user.id,
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
    },
    orderBy: {
      startsAt: 'asc',
    },
    take: 10,
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Participant Dashboard</h1>
        <p className="mt-2 text-gray-600">Welcome back, {profile?.name || session.user.email}!</p>
      </div>

      {profile && (
        <div className="mb-6">
          <MembershipTierSelector userId={session.user.id} currentTier={profile.membershipTier} />
        </div>
      )}

      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">My Schedule</h2>
        {myRegistrations.length === 0 ? (
          <p className="text-gray-600">You haven't registered for any activities yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myRegistrations.map((registration) => (
              <ActivityCard
                key={registration.id}
                id={registration.activity.id}
                title={registration.activity.title}
                startsAt={registration.activity.startsAt}
                endsAt={registration.activity.endsAt}
                location={registration.activity.location}
                programme={registration.activity.programme}
                capacity={registration.activity.capacity}
                currentRegistrations={registration.activity.registrations.length}
                accessibilityTags={registration.activity.accessibilityTags}
                tags={registration.activity.tags}
              />
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Recommended Activities</h2>
        {eligibleActivities.length === 0 ? (
          <p className="text-gray-600">No upcoming activities available.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {eligibleActivities.map((activity) => (
              <ActivityCard
                key={activity.id}
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
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
