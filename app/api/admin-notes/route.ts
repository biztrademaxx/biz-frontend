import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth-options'
import { UserRole } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    console.log('GET Session:', session)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const isArchived = searchParams.get('isArchived') === 'true'

    const userRole = session.user.role as UserRole

    // Base permissions - SuperAdmin can see all notes
    let whereClause: any = {
      OR: [
        { createdById: session.user.id }, // Can see own notes
        { visibility: { in: ['TEAM', 'PUBLIC'] } }, // Can see team/public notes
        {
          collaborators: {
            some: {
              userId: session.user.id
            }
          }
        }
      ]
    }

    // If user is SuperAdmin, they can see all notes regardless of permissions
    if (session.user.adminType === 'SUPER_ADMIN') {
      console.log('SuperAdmin detected - showing all notes')
      whereClause = { isArchived: isArchived }
    } else {
      // TEAM role restriction for regular users
      if (userRole && Object.values(UserRole).includes(userRole)) {
        whereClause.OR.push({
          AND: [
            { visibility: 'TEAM' },
            {
              OR: [
                { userRoles: { has: userRole } },
                { userRoles: { isEmpty: true } }
              ]
            }
          ]
        })
      }

      // Archive filter for regular users
      whereClause.isArchived = isArchived
    }

    const notes = await prisma.adminNote.findMany({
      where: whereClause,
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
      },
      orderBy: [
        { isPinned: 'desc' },
        { updatedAt: 'desc' }
      ]
    })

    // Safely handle null createdBy and collaborators
    const safeNotes = notes.map(note => ({
      ...note,
      createdBy: note.createdBy || {
        firstName: 'Unknown',
        lastName: 'User',
        email: 'unknown@example.com',
        role: 'USER' as UserRole
      },
      collaborators: note.collaborators.map(collab => ({
        ...collab,
        user: collab.user || {
          firstName: 'Unknown',
          lastName: 'User', 
          email: 'unknown@example.com',
          role: 'USER' as UserRole
        }
      }))
    }))

    console.log(`Returning ${safeNotes.length} notes`)
    return NextResponse.json(safeNotes)
  } catch (error) {
    console.error('Error fetching admin notes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch admin notes' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    console.log('POST Session:', session)
    
    if (!session?.user?.id) {
      console.log('No session user ID')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Session user ID:', session.user.id)
    console.log('Session adminType:', session.user.adminType)

    const body = await request.json()
    console.log('Request body:', body)
    
    if (!body.title || !body.content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      )
    }

    // Check if this is a SuperAdmin user
    if (session.user.adminType === 'SUPER_ADMIN') {
      console.log('User is a SuperAdmin, checking SuperAdmin table...')
      
      // Verify SuperAdmin exists
      const superAdminExists = await prisma.superAdmin.findUnique({
        where: { id: session.user.id },
        select: { id: true, email: true, name: true }
      })

      console.log('SuperAdmin lookup result:', superAdminExists)

      if (!superAdminExists) {
        console.log('SuperAdmin not found in database. Session ID:', session.user.id)
        return NextResponse.json(
          { error: 'SuperAdmin not found. Please log in again.' },
          { status: 400 }
        )
      }

      // Create note with SuperAdmin as creator
      const newNote = await prisma.adminNote.create({
        data: {
          title: body.title,
          content: body.content,
          category: body.category || 'General',
          tags: body.tags || [],
          visibility: body.visibility || 'PRIVATE',
          userRoles: body.userRoles || [],
          dashboardTypes: body.dashboardTypes || [],
          isPinned: body.isPinned || false,
          isArchived: body.isArchived || false,
          createdById: session.user.id,
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

      console.log('Note created successfully by SuperAdmin:', newNote.id)
      return NextResponse.json(newNote, { status: 201 })
    } else {
      // Handle regular User (existing logic)
      console.log('User is a regular user, checking User table...')
      
      const userExists = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { id: true, email: true, firstName: true, lastName: true }
      })

      console.log('User lookup result:', userExists)

      if (!userExists) {
        console.log('User not found in database. Session ID:', session.user.id)
        return NextResponse.json(
          { error: 'User not found. Please log in again.' },
          { status: 400 }
        )
      }

      const newNote = await prisma.adminNote.create({
        data: {
          title: body.title,
          content: body.content,
          category: body.category || 'General',
          tags: body.tags || [],
          visibility: body.visibility || 'PRIVATE',
          userRoles: body.userRoles || [],
          dashboardTypes: body.dashboardTypes || [],
          isPinned: body.isPinned || false,
          isArchived: body.isArchived || false,
          createdById: session.user.id,
        },
        include: {
          createdBy: {
            select: { firstName: true, lastName: true, email: true, role: true }
          },
          collaborators: {
            include: {
              user: {
                select: { firstName: true, lastName: true, email: true, role: true }
              }
            }
          }
        }
      })

      console.log('Note created successfully by User:', newNote.id)
      return NextResponse.json(newNote, { status: 201 })
    }
    
  } catch (error: any) {
    console.error('Error creating admin note:', error)
    
    if (error.code === 'P2003') { // Foreign key constraint failed
      return NextResponse.json(
        { error: 'User not found. Please log in again.' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create admin note' },
      { status: 500 }
    )
  }
}