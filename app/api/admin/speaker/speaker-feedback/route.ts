// app/api/admin/speaker/speaker-feedback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const page = Number(req.nextUrl.searchParams.get("page")) || 1;
    const limit = Number(req.nextUrl.searchParams.get("limit")) || 50;
    const skip = (page - 1) * limit;

    // First, get reviews that are associated with speakers
    // We need to find reviews where the event has speaker sessions
    const speakerSessions = await prisma.speakerSession.findMany({
      select: {
        id: true,
        speakerId: true,
        title: true,
        eventId: true,
      },
      skip,
      take: limit,
    });

    // Get unique event IDs
    const eventIds = [...new Set(
      speakerSessions
        .map(session => session.eventId)
        .filter((id): id is string => id !== null)
    )];

    // Get all reviews for these events
    const reviews = await prisma.review.findMany({
      where: {
        eventId: {
          in: eventIds,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Process each review with error handling
    const feedbacksWithDetails = await Promise.all(
      reviews.map(async (review) => {
        // Find the speaker session for this event
        const session = speakerSessions.find(s => s.eventId === review.eventId);
        
        if (!session) return null;

        let speakerDetails = null;
        let userDetails = null;
        let eventDetails = null;

        // Fetch speaker details with error handling
        try {
          if (session.speakerId) {
            speakerDetails = await prisma.user.findUnique({
              where: { id: session.speakerId },
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatar: true,
              },
            });
          }
        } catch (error) {
          console.warn(`Error fetching speaker ${session.speakerId}:`, error);
        }

        // Fetch user details with error handling
        try {
          if (review.userId) {
            userDetails = await prisma.user.findUnique({
              where: { id: review.userId },
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatar: true,
              },
            });
          }
        } catch (error) {
          console.warn(`Error fetching user ${review.userId}:`, error);
        }

        // Fetch event details with error handling
        try {
          if (review.eventId) {
            eventDetails = await prisma.event.findUnique({
              where: { id: review.eventId },
              select: {
                id: true,
                title: true,
                thumbnailImage: true,
              },
            });
          }
        } catch (error) {
          console.warn(`Error fetching event ${review.eventId}:`, error);
        }

        // Build speaker data with fallbacks
        const speakerData = speakerDetails ? {
          id: speakerDetails.id,
          firstName: speakerDetails.firstName,
          lastName: speakerDetails.lastName,
          email: speakerDetails.email,
          avatar: speakerDetails.avatar,
          name: `${speakerDetails.firstName || ''} ${speakerDetails.lastName || ''}`.trim() || 'Unknown Speaker',
        } : {
          id: session.speakerId || 'unknown',
          firstName: 'Unknown',
          lastName: 'Speaker',
          email: 'unknown@example.com',
          avatar: null,
          name: 'Unknown Speaker',
        };

        // Build user data with fallbacks
        const userData = userDetails ? {
          id: userDetails.id,
          firstName: userDetails.firstName,
          lastName: userDetails.lastName,
          email: userDetails.email,
          avatar: userDetails.avatar,
          name: `${userDetails.firstName || ''} ${userDetails.lastName || ''}`.trim() || 'Unknown User',
        } : {
          id: review.userId || 'unknown',
          firstName: 'Unknown',
          lastName: 'User',
          email: 'unknown@example.com',
          avatar: null,
          name: 'Unknown User',
        };

        // Build event data with fallbacks
        const eventData = eventDetails ? {
          id: eventDetails.id,
          title: eventDetails.title,
          thumbnailImage: eventDetails.thumbnailImage,
        } : {
          id: review.eventId || 'unknown',
          title: 'Unknown Event',
          thumbnailImage: null,
        };

        return {
          id: review.id,
          rating: review.rating,
          title: review.title,
          comment: review.comment,
          isApproved: review.isApproved,
          isPublic: review.isPublic,
          createdAt: review.createdAt,
          updatedAt: review.updatedAt,
          speaker: speakerData,
          user: userData,
          event: eventData,
          sessionTitle: session.title,
        };
      })
    );

    // Filter out null values
    const feedback = feedbacksWithDetails.filter((f): f is NonNullable<typeof f> => f !== null);

    // Calculate statistics
    const stats = {
      totalFeedback: feedback.length,
      pendingReviews: feedback.filter((f) => !f.isApproved).length,
      approvedFeedback: feedback.filter((f) => f.isApproved).length,
      averageRating:
        feedback.length > 0
          ? Number(
              (
                feedback.reduce((sum, f) => sum + f.rating, 0) /
                feedback.length
              ).toFixed(1)
            )
          : 0,
      page,
      limit,
    };

    return NextResponse.json({ feedback, stats });
  } catch (error) {
    console.error("Error fetching speaker feedback:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch speaker feedback",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}