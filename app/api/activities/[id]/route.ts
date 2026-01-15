import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { requireStaff } from '@/lib/permissions'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const activity = await prisma.activity.update({
      where: { id: params.id },
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

    // Update form template
    const existingTemplate = await prisma.formTemplate.findUnique({
      where: { activityId: params.id },
      include: { fields: true },
    })

    if (formFields && formFields.length > 0) {
      if (existingTemplate) {
        // Delete existing fields
        await prisma.formField.deleteMany({
          where: { templateId: existingTemplate.id },
        })

        // Create new fields
        await Promise.all(
          formFields.map((field: any, index: number) =>
            prisma.formField.create({
              data: {
                templateId: existingTemplate.id,
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
      } else {
        // Create new template
        const template = await prisma.formTemplate.create({
          data: {
            activityId: params.id,
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
    } else if (existingTemplate) {
      // Remove template if no fields
      await prisma.formTemplate.delete({
        where: { id: existingTemplate.id },
      })
    }

    return NextResponse.json({ success: true, activity })
  } catch (error: any) {
    console.error('Update activity error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
