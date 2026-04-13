import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth-options'
import { UserRole } from '@prisma/client'

// Update the Params interface to be async
interface Params {
  params: Promise<{
    id: string
  }>
}

// ================= GET SINGLE NOTE ==================
export async function GET(request: NextRequest, { params }: Params) {
  try {
    // Await the params first
    const { id } = await params
    
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const note = await prisma.adminNote.findUnique({
      where: { id }, // Use the awaited id
      include: {
        createdBy: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            role: true
          }
        },
        collaborators: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                role: true
              }
            }
          }
        }
      }
    })

    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }

    // Check access permissions with proper type checking
    const userRole = session.user.role as UserRole
    const hasAccess = 
      note.createdById === session.user.id ||
      note.visibility === 'PUBLIC' ||
      (note.visibility === 'TEAM' && userRole && note.userRoles.includes(userRole)) ||
      note.collaborators.some(collab => collab.userId === session.user.id)

    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    return NextResponse.json(note)
  } catch (error) {
    console.error('Error fetching admin note:', error)
    return NextResponse.json(
      { error: 'Failed to fetch admin note' },
      { status: 500 }
    )
  }
}

// ================= UPDATE NOTE ==================
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    // Await the params first
    const { id } = await params
    
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Check if user can edit this note
    const existingNote = await prisma.adminNote.findUnique({
      where: { id }, // Use the awaited id
      include: {
        collaborators: true
      }
    })

    if (!existingNote) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }

    const canEdit = 
      existingNote.createdById === session.user.id ||
      existingNote.collaborators.some(
        collab => collab.userId === session.user.id && 
        ['EDIT', 'MANAGE'].includes(collab.permission)
      )

    if (!canEdit) {
      return NextResponse.json({ error: 'Edit permission denied' }, { status: 403 })
    }

    const updatedNote = await prisma.adminNote.update({
      where: { id }, // Use the awaited id
      data: {
        title: body.title,
        content: body.content,
        category: body.category,
        tags: body.tags,
        visibility: body.visibility,
        userRoles: body.userRoles,
        dashboardTypes: body.dashboardTypes,
        isPinned: body.isPinned,
        isArchived: body.isArchived,
        archivedAt: body.isArchived ? new Date() : null
      },
      include: {
        createdBy: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            role: true
          }
        },
        collaborators: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                role: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json(updatedNote)
  } catch (error) {
    console.error('Error updating admin note:', error)
    return NextResponse.json(
      { error: 'Failed to update admin note' },
      { status: 500 }
    )
  }
}

// ================= DELETE NOTE ==================
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    // Await the params first
    const { id } = await params
    
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user can delete this note
    const existingNote = await prisma.adminNote.findUnique({
      where: { id } // Use the awaited id
    })

    if (!existingNote) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }

    const canDelete = existingNote.createdById === session.user.id

    if (!canDelete) {
      return NextResponse.json({ error: 'Delete permission denied' }, { status: 403 })
    }

    await prisma.adminNote.delete({
      where: { id } // Use the awaited id
    })

    return NextResponse.json({ message: 'Note deleted successfully' })
  } catch (error) {
    console.error('Error deleting admin note:', error)
    return NextResponse.json(
      { error: 'Failed to delete admin note' },
      { status: 500 }
    )
  }
}