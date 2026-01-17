// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { UserRole as Role, MembershipTier } from '@prisma/client'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { 
      email, 
      password, 
      role,
      // Profile fields
      name,
      phone,
      membershipTier,
      caregiverPhone,
      medicalStatus,
      medicalHistory,
      emergencyContactName,
      emergencyContactPhone,
      emergencyNotes,
      accessibilityNeeds,
      skills,
      interests,
    } = body

    // Validation
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      )
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      )
    }

    // Validate participant-specific fields
    if (role === 'PARTICIPANT' && !caregiverPhone) {
      return NextResponse.json(
        { error: 'Caregiver phone is required for participants' },
        { status: 400 }
      )
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)

    // Create user with profile in a transaction
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: passwordHash,
        role: role as Role || 'PARTICIPANT',
        profile: {
          create: {
            name,
            phone: phone || null,
            membershipTier: (membershipTier as MembershipTier) || 'AD_HOC',
            caregiverPhone: caregiverPhone || null,
            medicalStatus: medicalStatus || null,
            medicalHistory: medicalHistory || null,
            emergencyContactName: emergencyContactName || null,
            emergencyContactPhone: emergencyContactPhone || null,
            emergencyNotes: emergencyNotes || null,
            accessibilityNeeds: accessibilityNeeds || [],
            skills: skills || [],
            interests: interests || [],
          },
        },
      },
      include: {
        profile: true,
      },
    })

    // Don't return password hash
    const { passwordHash: _, ...userWithoutPassword } = user

    return NextResponse.json(
      { 
        message: 'User created successfully',
        user: userWithoutPassword 
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}