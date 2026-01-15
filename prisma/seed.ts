import { PrismaClient, UserRole, MembershipTier } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create programmes
  const stepProgramme = await prisma.programme.upsert({
    where: { id: 'step-1' },
    update: {},
    create: {
      id: 'step-1',
      name: 'STEP',
      description: 'Supported Training and Employment Programme',
    },
  })

  const socialProgramme = await prisma.programme.upsert({
    where: { id: 'social-1' },
    update: {},
    create: {
      id: 'social-1',
      name: 'Social Activities',
      description: 'Community social activities and events',
    },
  })

  console.log('Created programmes')

  // Create users with hashed passwords
  const hashedPassword = await bcrypt.hash('password123', 10)

  const participant1 = await prisma.user.upsert({
    where: { email: 'participant1@example.com' },
    update: {},
    create: {
      email: 'participant1@example.com',
      password: hashedPassword,
      role: UserRole.PARTICIPANT,
      profile: {
        create: {
          name: 'Alice Tan',
          phone: '+65 9123 4567',
          membershipTier: MembershipTier.TWO_PER_WEEK,
          accessibilityNeeds: ['Wheelchair access'],
        },
      },
    },
    include: { profile: true },
  })

  const participant2 = await prisma.user.upsert({
    where: { email: 'participant2@example.com' },
    update: {},
    create: {
      email: 'participant2@example.com',
      password: hashedPassword,
      role: UserRole.PARTICIPANT,
      profile: {
        create: {
          name: 'Bob Lee',
          phone: '+65 9234 5678',
          membershipTier: MembershipTier.ONE_PER_WEEK,
        },
      },
    },
    include: { profile: true },
  })

  const volunteer1 = await prisma.user.upsert({
    where: { email: 'volunteer1@example.com' },
    update: {},
    create: {
      email: 'volunteer1@example.com',
      password: hashedPassword,
      role: UserRole.VOLUNTEER,
      profile: {
        create: {
          name: 'Charlie Wong',
          phone: '+65 9345 6789',
          skills: ['First Aid', 'Sign Language'],
          interests: ['Arts', 'Sports'],
        },
      },
    },
    include: { profile: true },
  })

  const staff1 = await prisma.user.upsert({
    where: { email: 'staff@example.com' },
    update: {},
    create: {
      email: 'staff@example.com',
      password: hashedPassword,
      role: UserRole.STAFF,
      profile: {
        create: {
          name: 'Diana Lim',
          phone: '+65 9456 7890',
        },
      },
    },
    include: { profile: true },
  })

  console.log('Created users')

  // Create activities
  const now = new Date()
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  const twoWeeks = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)

  const activity1 = await prisma.activity.create({
    data: {
      title: 'Art Workshop: Watercolor Painting',
      description: 'Learn basic watercolor techniques in a relaxed, supportive environment.',
      programmeId: stepProgramme.id,
      startsAt: new Date(nextWeek.getTime() + 10 * 60 * 60 * 1000), // 10 AM next week
      endsAt: new Date(nextWeek.getTime() + 12 * 60 * 60 * 1000), // 12 PM
      location: 'Community Center, Room 101',
      capacity: 15,
      volunteerRequired: 2,
      volunteerRatio: 5.0,
      tags: ['Arts', 'Workshop'],
      accessibilityTags: ['Wheelchair-friendly'],
    },
  })

  const activity2 = await prisma.activity.create({
    data: {
      title: 'Sports Day: Basketball',
      description: 'Friendly basketball game for all skill levels.',
      programmeId: socialProgramme.id,
      startsAt: new Date(nextWeek.getTime() + 14 * 60 * 60 * 1000), // 2 PM next week
      endsAt: new Date(nextWeek.getTime() + 16 * 60 * 60 * 1000), // 4 PM
      location: 'Sports Complex, Court 2',
      capacity: 20,
      volunteerRequired: 3,
      volunteerRatio: 6.0,
      tags: ['Sports', 'Physical'],
      accessibilityTags: [],
    },
  })

  const activity3 = await prisma.activity.create({
    data: {
      title: 'Cooking Class: Healthy Meals',
      description: 'Learn to prepare nutritious and delicious meals.',
      programmeId: stepProgramme.id,
      startsAt: new Date(twoWeeks.getTime() + 10 * 60 * 60 * 1000), // 10 AM in 2 weeks
      endsAt: new Date(twoWeeks.getTime() + 13 * 60 * 60 * 1000), // 1 PM
      location: 'Kitchen Lab, Building A',
      capacity: 12,
      volunteerRequired: 2,
      volunteerRatio: 4.0,
      tags: ['Cooking', 'Life Skills'],
      accessibilityTags: ['Wheelchair-friendly', 'Hearing loop'],
    },
  })

  console.log('Created activities')

  // Create form template for activity 1
  const formTemplate1 = await prisma.formTemplate.create({
    data: {
      activityId: activity1.id,
    },
  })

  await prisma.formField.createMany({
    data: [
      {
        templateId: formTemplate1.id,
        key: 'wheelchair_access',
        label: 'Do you need wheelchair access?',
        type: 'boolean',
        required: false,
        order: 0,
      },
      {
        templateId: formTemplate1.id,
        key: 'caregiver_attending',
        label: 'Will a caregiver be attending with you?',
        type: 'boolean',
        required: false,
        order: 1,
      },
      {
        templateId: formTemplate1.id,
        key: 'experience_level',
        label: 'What is your experience level?',
        type: 'select',
        required: false,
        options: JSON.stringify(['Beginner', 'Intermediate', 'Advanced']),
        order: 2,
      },
    ],
  })

  console.log('Created form templates')

  // Create some registrations
  await prisma.registration.create({
    data: {
      activityId: activity1.id,
      participantId: participant1.id,
      status: 'CONFIRMED',
      answers: {
        create: [
          {
            fieldId: (await prisma.formField.findFirst({
              where: { key: 'wheelchair_access', templateId: formTemplate1.id },
            }))!.id,
            valueJson: JSON.stringify(true),
          },
        ],
      },
    },
  })

  await prisma.registration.create({
    data: {
      activityId: activity2.id,
      participantId: participant2.id,
      status: 'CONFIRMED',
    },
  })

  console.log('Created registrations')

  // Create volunteer assignments
  await prisma.volunteerAssignment.create({
    data: {
      activityId: activity1.id,
      volunteerId: volunteer1.id,
      status: 'CONFIRMED',
    },
  })

  console.log('Created volunteer assignments')

  console.log('Seeding completed!')
  console.log('\nTest accounts:')
  console.log('Participant 1: participant1@example.com / password123')
  console.log('Participant 2: participant2@example.com / password123')
  console.log('Volunteer: volunteer1@example.com / password123')
  console.log('Staff: staff@example.com / password123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
