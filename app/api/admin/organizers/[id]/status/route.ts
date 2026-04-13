import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth-options'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is an admin
    const superAdmin = await prisma.superAdmin.findUnique({
      where: { id: session.user.id }
    })

    const subAdmin = await prisma.subAdmin.findUnique({
      where: { id: session.user.id }
    })

    if (!superAdmin && !subAdmin) {
      return NextResponse.json({ error: 'Access denied. Admin privileges required.' }, { status: 403 })
    }

    const { action, message } = await request.json()
    const organizerId = params.id

    // Find the organizer
    const organizer = await prisma.user.findUnique({
      where: { 
        id: organizerId,
        role: 'ORGANIZER'
      }
    })

    if (!organizer) {
      return NextResponse.json({ error: 'Organizer not found' }, { status: 404 })
    }

    let updateData: any = {}

    if (action === 'approve') {
      updateData.isVerified = true
      updateData.isActive = true
    } else if (action === 'reject') {
      updateData.isVerified = false
      updateData.isActive = false
    } else if (action === 'suspend') {
      updateData.isActive = false
    } else if (action === 'activate') {
      updateData.isActive = true
    }

    // Update organizer status
    const updatedOrganizer = await prisma.user.update({
      where: { id: organizerId },
      data: updateData
    })

    // Log the admin action
    await prisma.adminLog.create({
      data: {
        adminId: session.user.id,
        adminType: superAdmin ? 'SUPER_ADMIN' : 'SUB_ADMIN',
        action: `ORGANIZER_${action.toUpperCase()}`,
        resource: 'ORGANIZER',
        resourceId: organizerId,
        details: {
          organizerEmail: organizer.email,
          organizerName: organizer.organizationName || `${organizer.firstName} ${organizer.lastName}`,
          action,
          message,
          timestamp: new Date().toISOString()
        },
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    })

    return NextResponse.json({ 
      organizer: updatedOrganizer,
      message: `Organizer ${action}d successfully` 
    })

  } catch (error) {
    console.error('Error updating organizer status:', error)
    return NextResponse.json(
      { error: 'Failed to update organizer status' },
      { status: 500 }
    )
  }
}