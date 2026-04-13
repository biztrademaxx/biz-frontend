import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const eventId = (await params).id
    const { searchParams } = new URL(request.url)
    const includeReplies = searchParams.get("includeReplies") === "true"

    console.log("[v0] Fetching reviews for event ID:", eventId)

    if (!prisma?.event) {
      return NextResponse.json({
        event: { id: eventId, title: null, averageRating: 0, totalReviews: 0 },
        reviews: [],
      })
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, title: true, averageRating: true, totalReviews: true },
    })

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // First get reviews without user data to avoid null issues
    const reviews = await prisma.review.findMany({
      where: { eventId },
      orderBy: { createdAt: "desc" },
    })

    // Then fetch user data for each review separately
    const reviewsWithUsers = await Promise.all(
      reviews.map(async (review) => {
        const user = await prisma.user.findUnique({
          where: { id: review.userId },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        })

        let replies: any[] = []
        if (includeReplies) {
          const reviewReplies = await prisma.reviewReply.findMany({
            where: { reviewId: review.id },
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatar: true,
                },
              },
            },
            orderBy: { createdAt: "asc" },
          })

          replies = reviewReplies.map(rep => ({
            id: rep.id,
            content: rep.content,
            createdAt: rep.createdAt,
            isOrganizerReply: rep.isOrganizerReply,
            user: rep.user || {
              id: rep.userId,
              firstName: 'Unknown',
              lastName: 'User',
              avatar: null
            }
          }))
        }

        return {
          id: review.id,
          rating: review.rating,
          title: review.title,
          comment: review.comment,
          createdAt: review.createdAt,
          isApproved: review.isApproved,
          isPublic: review.isPublic,
          user: user || {
            id: review.userId,
            firstName: 'Unknown',
            lastName: 'User',
            avatar: null
          },
          replies
        }
      })
    )

    return NextResponse.json({
      event: {
        ...event,
        averageRating: event?.averageRating ?? 0,
        totalReviews: event?.totalReviews ?? 0,
      },
      reviews: reviewsWithUsers,
    })
  } catch (error) {
    console.error("[v0] Error fetching reviews:", error)
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { rating, title, comment } = await request.json()
    const userId = session.user.id
    const eventId = (await params).id

    console.log("📩 Received review for event:", eventId)

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 })
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const existingReview = await prisma.review.findFirst({
      where: { eventId, userId },
    })

    if (existingReview) {
      return NextResponse.json({ error: "You have already reviewed this event" }, { status: 400 })
    }

    // Create review without including user initially
    const review = await prisma.review.create({
      data: {
        rating: Number(rating),
        title: title || "",
        comment: comment || "",
        eventId,
        userId,
        isPublic: true,
        isApproved: true,
      },
    })

    // Recalculate event rating
    const eventReviews = await prisma.review.findMany({
      where: { eventId, isApproved: true },
      select: { rating: true },
    })

    const totalRating = eventReviews.reduce((sum, r) => sum + r.rating, 0)
    const averageRating = eventReviews.length > 0 ? totalRating / eventReviews.length : 0

    console.log("⭐ Updating event rating:", averageRating, "Reviews:", eventReviews.length)

    await prisma.event.update({
      where: { id: eventId },
      data: {
        averageRating,
        totalReviews: eventReviews.length,
      },
    })

    // Return review with user data
    return NextResponse.json({
      ...review,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
      }
    }, { status: 201 })
  } catch (error) {
    console.error("Error creating review:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}