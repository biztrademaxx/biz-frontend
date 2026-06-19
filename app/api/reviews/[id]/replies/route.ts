import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'

export async function POST(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id: reviewId } = await context.params   // ✅ Use 'id' and rename to reviewId
        const session = await getServerSession(authOptions)

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Check if user is organizer of the event
        const review = await prisma.review.findUnique({
            where: { id: reviewId },
            include: { event: { select: { organizerId: true } } }
        })

        if (!review) {
            return NextResponse.json({ error: 'Review not found' }, { status: 404 })
        }

        if (review.event?.organizerId !== session.user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { content } = await request.json()

        if (!content || !content.trim()) {
            return NextResponse.json(
                { error: 'Reply content is required' },
                { status: 400 }
            )
        }

        // Create the reply
        const reply = await prisma.reviewReply.create({
            data: {
                content: content.trim(),
                reviewId: reviewId,
                userId: session.user.id,
                isOrganizerReply: true
            },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        avatar: true
                    }
                }
            }
        })

        return NextResponse.json(reply)
    } catch (error) {
        console.error('Error creating reply:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: reviewId } = await params
        const session = await getServerSession(authOptions)

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Check if user is organizer of the event
        const review = await prisma.review.findUnique({
            where: {
                id: reviewId
            },
            include: {
                event: {
                    select: {
                        organizerId: true
                    }
                }
            }
        })

        if (!review) {
            return NextResponse.json({ error: 'Review not found' }, { status: 404 })
        }

        if (review.event?.organizerId !== session.user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get all replies for this review
        const replies = await prisma.reviewReply.findMany({
            where: {
                reviewId: reviewId
            },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        avatar: true
                    }
                }
            },
            orderBy: {
                createdAt: 'asc'
            }
        })

        return NextResponse.json({ replies })
    } catch (error) {
        console.error('Error fetching replies:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}