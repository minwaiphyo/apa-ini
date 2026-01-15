import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { ActivityForm } from '@/components/ActivityForm'

export default async function EditActivityPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'STAFF') {
    redirect('/login')
  }

  const activity = await prisma.activity.findUnique({
    where: { id: params.id },
    include: {
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

  const programmes = await prisma.programme.findMany({
    orderBy: {
      name: 'asc',
    },
  })

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Edit Activity</h1>
      <ActivityForm programmes={programmes} activity={activity} />
    </div>
  )
}
