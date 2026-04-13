import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth-options';

// POST: Create a new organizer review
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'You must be logged in to submit a review' },
        { status: 401 }
      );
    }

    const { id: organizerId } = await params;

    if (!organizerId) {
      return NextResponse.json({ error: 'Invalid organizer ID' }, { status: 400 });
    }

    const body = await request.json();
    const { rating, title, comment } = body;

    if (!rating || !comment) {
      return NextResponse.json(
        { error: 'Rating and comment are required' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Check if organizer exists
    const organizer = await prisma.user.findFirst({
      where: { 
        id: organizerId, 
        role: 'ORGANIZER' 
      }
    });

    if (!organizer) {
      return NextResponse.json({ error: 'Organizer not found' }, { status: 404 });
    }

    // Check if user already reviewed this organizer
    const existingReview = await prisma.review.findFirst({
      where: {
        userId: session.user.id,
        organizerId: organizerId
      }
    });

    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this organizer' },
        { status: 400 }
      );
    }

    // Create the review
    const review = await prisma.review.create({
      data: {
        userId: session.user.id,
        organizerId: organizerId,
        rating: parseInt(rating),
        title: title || '',
        comment,
        isApproved: true,
        isPublic: true,
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
    });

    // Update organizer's average rating and total reviews
    const allReviews = await prisma.review.findMany({
      where: { 
        organizerId: organizerId, 
        isApproved: true, 
        isPublic: true 
      }
    });

    const totalReviews = allReviews.length;
    const averageRating = totalReviews > 0
      ? allReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0;

    await prisma.user.update({
      where: { id: organizerId },
      data: {
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews
      }
    });

    return NextResponse.json(
      {
        id: review.id,
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        createdAt: review.createdAt.toISOString(),
        user: review.user
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating organizer review:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET: Fetch reviews for an organizer
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: organizerId } = await params;

    if (!organizerId) {
      return NextResponse.json({ error: 'Invalid organizer ID' }, { status: 400 });
    }

    const organizer = await prisma.user.findFirst({
      where: { 
        id: organizerId, 
        role: 'ORGANIZER' 
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        organizationName: true,
        averageRating: true,
        totalReviews: true
      }
    });

    if (!organizer) {
      return NextResponse.json({ error: 'Organizer not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const reviews = await prisma.review.findMany({
      where: { 
        organizerId: organizerId, 
        isApproved: true, 
        isPublic: true 
      },
      include: {
        user: { 
          select: { 
            id: true, 
            firstName: true, 
            lastName: true, 
            avatar: true 
          } 
        },
        replies: {
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
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    });

    const totalReviews = await prisma.review.count({
      where: { 
        organizerId: organizerId, 
        isApproved: true, 
        isPublic: true 
      }
    });

    return NextResponse.json({
      organizer: {
        id: organizer.id,
        name: organizer.organizationName || `${organizer.firstName} ${organizer.lastName}`,
        averageRating: organizer.averageRating || 0,
        totalReviews: organizer.totalReviews || 0
      },
      reviews: reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        title: r.title,
        comment: r.comment,
        createdAt: r.createdAt.toISOString(),
        user: r.user,
        replies: r.replies.map((rep) => ({
          id: rep.id,
          content: rep.content,
          createdAt: rep.createdAt.toISOString(),
          isOrganizerReply: rep.isOrganizerReply,
          user: rep.user
        }))
      })),
      pagination: {
        page,
        limit,
        total: totalReviews,
        pages: Math.ceil(totalReviews / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching organizer reviews:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}