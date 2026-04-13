import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Check if sub-admin exists and is active
    const subAdmin = await prisma.subAdmin.findUnique({
      where: { 
        email: email.toLowerCase(),
        isActive: true 
      },
      include: { 
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!subAdmin) {
      return NextResponse.json(
        { error: 'Invalid credentials or account inactive' },
        { status: 401 }
      )
    }

    // Verify password using bcrypt directly
    const isValidPassword = await bcrypt.compare(password, subAdmin.password)
    if (!isValidPassword) {
      // Increment login attempts
      await prisma.subAdmin.update({
        where: { id: subAdmin.id },
        data: { loginAttempts: { increment: 1 } }
      })

      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Get IP address safely
    const forwarded = request.headers.get('x-forwarded-for')
    const ipAddress = forwarded ? forwarded.split(',')[0] : 'unknown'

    // Create admin log
    await prisma.adminLog.create({
      data: {
        adminId: subAdmin.id,
        adminType: 'SUB_ADMIN',
        action: 'LOGIN',
        resource: 'AUTH',
        ipAddress,
        userAgent: request.headers.get('user-agent') || '',
        subAdminId: subAdmin.id
      }
    })

    // Update last login and reset login attempts
    await prisma.subAdmin.update({
      where: { id: subAdmin.id },
      data: { 
        lastLogin: new Date(),
        loginAttempts: 0 
      }
    })

    const response = NextResponse.json({
      message: 'Login successful',
      user: {
        id: subAdmin.id,
        email: subAdmin.email,
        name: subAdmin.name,
        role: 'SUB_ADMIN',
        permissions: subAdmin.permissions,
        createdBy: subAdmin.createdBy.name
      }
    })

    // Set cookies for sub-admin
    response.cookies.set('adminToken', `subadmin-${subAdmin.id}`, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 // 24 hours
    })

    return response

  } catch (error) {
    console.error('Sub-admin login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}