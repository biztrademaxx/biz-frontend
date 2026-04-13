// app/api/exhibitors/[id]/reviews/route.ts

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

// ✅ POST — Create a new review
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "You must be logged in" }, { status: 401 });
    }

    const params = await context.params;
    const exhibitorId = params.id;
    const body = await request.json();

    const { rating, title, comment, replyToReviewId } = body;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // ✅ If replying to a review
    if (replyToReviewId) {
      const review = await prisma.review.findUnique({
        where: { id: replyToReviewId },
      });
      if (!review) {
        return NextResponse.json({ error: "Review not found" }, { status: 404 });
      }

      const reply = await prisma.reviewReply.create({
        data: {
          reviewId: replyToReviewId,
          userId: user.id,
          content: comment,
          isOrganizerReply: user.role === "EXHIBITOR",
        },
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, avatar: true },
          },
        },
      });

      return NextResponse.json(reply, { status: 201 });
    }

    // ✅ Else, create a new review (as before)
    if (!rating || !comment) {
      return NextResponse.json(
        { error: "Rating and comment are required" },
        { status: 400 }
      );
    }

    const exhibitor = await prisma.user.findFirst({
      where: { id: exhibitorId, role: "EXHIBITOR" },
    });

    if (!exhibitor) {
      return NextResponse.json({ error: "Exhibitor not found" }, { status: 404 });
    }

    const review = await prisma.review.create({
      data: {
        userId: user.id,
        exhibitorId,
        rating: parseInt(rating),
        title: title || "",
        comment,
        isApproved: true,
        isPublic: true,
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
      },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error("Error creating review or reply:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


// ✅ GET — Fetch reviews
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const exhibitorId = params.id

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    const reviews = await prisma.review.findMany({
      where: { exhibitorId, isApproved: true, isPublic: true },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
        replies: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
          },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    })

    const totalReviews = await prisma.review.count({
      where: { exhibitorId, isApproved: true, isPublic: true },
    })

    return NextResponse.json({
      reviews,
      pagination: {
        page,
        limit,
        total: totalReviews,
        pages: Math.ceil(totalReviews / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching reviews:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// ✅ PATCH — Add a reply to a specific review
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const params = await context.params
    const exhibitorId = params.id
    const body = await request.json()
    const { reviewId, content } = body

    if (!reviewId || !content) {
      return NextResponse.json({ error: "Missing reviewId or content" }, { status: 400 })
    }

    // Ensure this exhibitor owns the review
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      select: { exhibitorId: true },
    })

    if (!review || review.exhibitorId !== exhibitorId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const reply = await prisma.reviewReply.create({

      data: {
        content,
        reviewId,
        userId: session.user.id,
        isOrganizerReply: true,
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
      },
    })

    return NextResponse.json(reply, { status: 201 })
  } catch (error) {
    console.error("Error adding reply:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
