// app/api/admin/speaker/speaker-feedback/[id]/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // First get the review
    const review = await prisma.review.findUnique({
      where: { id: params.id },
    });

    if (!review) {
      return NextResponse.json({ error: "Feedback not found" }, { status: 404 });
    }

    // Find the speaker session related to this review
    const speakerSession = await prisma.speakerSession.findFirst({
      where: {
        eventId: review.eventId || undefined,
      },
      select: {
        id: true,
        speakerId: true,
        title: true,
      },
    });

    let speakerDetails = null;
    let userDetails = null;
    let eventDetails = null;

    // Fetch speaker details with error handling
    try {
      if (speakerSession?.speakerId) {
        speakerDetails = await prisma.user.findUnique({
          where: { id: speakerSession.speakerId },
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
      console.warn(`Error fetching speaker ${speakerSession?.speakerId}:`, error);
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
    } : {
      id: speakerSession?.speakerId || 'unknown',
      firstName: 'Unknown',
      lastName: 'Speaker',
      email: 'unknown@example.com',
      avatar: null,
    };

    // Build user data with fallbacks
    const userData = userDetails ? {
      id: userDetails.id,
      firstName: userDetails.firstName,
      lastName: userDetails.lastName,
      email: userDetails.email,
      avatar: userDetails.avatar,
    } : {
      id: review.userId || 'unknown',
      firstName: 'Unknown',
      lastName: 'User',
      email: 'unknown@example.com',
      avatar: null,
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

    // Build response
    const feedback = {
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
      sessionTitle: speakerSession?.title || 'Unknown Session',
    };

    return NextResponse.json(feedback);
  } catch (error) {
    console.error("Error fetching feedback:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch feedback",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { isApproved, isPublic } = body;

    // Update the review
    const review = await prisma.review.update({
      where: { id: params.id },
      data: {
        ...(isApproved !== undefined && { isApproved }),
        ...(isPublic !== undefined && { isPublic }),
      },
    });

    // Find the speaker session
    const speakerSession = await prisma.speakerSession.findFirst({
      where: {
        eventId: review.eventId || undefined,
      },
      select: {
        id: true,
        speakerId: true,
        title: true,
      },
    });

    let speakerDetails = null;
    let userDetails = null;
    let eventDetails = null;

    // Fetch speaker details with error handling
    try {
      if (speakerSession?.speakerId) {
        speakerDetails = await prisma.user.findUnique({
          where: { id: speakerSession.speakerId },
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
      console.warn(`Error fetching speaker ${speakerSession?.speakerId}:`, error);
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
    } : {
      id: speakerSession?.speakerId || 'unknown',
      firstName: 'Unknown',
      lastName: 'Speaker',
      email: 'unknown@example.com',
      avatar: null,
    };

    // Build user data with fallbacks
    const userData = userDetails ? {
      id: userDetails.id,
      firstName: userDetails.firstName,
      lastName: userDetails.lastName,
      email: userDetails.email,
      avatar: userDetails.avatar,
    } : {
      id: review.userId || 'unknown',
      firstName: 'Unknown',
      lastName: 'User',
      email: 'unknown@example.com',
      avatar: null,
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

    // Build response
    const feedback = {
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
      sessionTitle: speakerSession?.title || 'Unknown Session',
    };

    return NextResponse.json(feedback);
  } catch (error) {
    console.error("Error updating feedback:", error);
    return NextResponse.json(
      {
        error: "Failed to update feedback",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}