import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { requireStaff } from '@/lib/permissions'

export async function POST(request: NextRequest) {
  try {
    await requireStaff()

    const body = await request.json()
    const {
      title,
      description,
      programmeId,
      startsAt,
      endsAt,
      location,
      capacity,
      volunteerRequired,
      volunteerRatio,
      tags,
      accessibilityTags,
      formFields,
    } = body

    const activity = await prisma.activity.create({
      data: {
        title,
        description,
        programmeId,
        startsAt: new Date(startsAt),
        endsAt: new Date(endsAt),
        location,
        capacity: parseInt(capacity),
        volunteerRequired: parseInt(volunteerRequired) || 0,
        volunteerRatio: parseFloat(volunteerRatio) || 5.0,
        tags,
        accessibilityTags,
      },
    })

    // Create form template if fields provided
    if (formFields && formFields.length > 0) {
      const template = await prisma.formTemplate.create({
        data: {
          activityId: activity.id,
        },
      })

      await Promise.all(
        formFields.map((field: any, index: number) =>
          prisma.formField.create({
            data: {
              templateId: template.id,
              key: field.key,
              label: field.label,
              type: field.type,
              required: field.required || false,
              options: field.options ? JSON.stringify(field.options) : null,
              conditionalLogic: field.conditionalLogic || null,
              order: index,
            },
          })
        )
      )
    }

    return NextResponse.json({ success: true, activity })
  } catch (error: any) {
    console.error('Create activity error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
