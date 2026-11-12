/** @jest-environment node */
import { NextRequest } from "next/server"
import { GET } from "../route"

const mockFindMany = jest.fn()
let mockPrisma: { pushNotification: { findMany: typeof mockFindMany } } | null = null

jest.mock("@/lib/prisma", () => ({
  get prisma() { return mockPrisma },
}))

describe("legacy notification database availability", () => {
  beforeEach(() => {
    mockFindMany.mockReset()
    mockPrisma = null
  })

  it("returns a service error when the optional database is unavailable", async () => {
    const response = await GET(new NextRequest("http://localhost/api/notifications"))

    expect(response.status).toBe(503)
    expect(await response.json()).toEqual({ error: "Database is not configured for this legacy endpoint" })
    expect(mockFindMany).not.toHaveBeenCalled()
  })

  it("still returns mapped notifications when the database is configured", async () => {
    mockPrisma = { pushNotification: { findMany: mockFindMany } }
    mockFindMany.mockResolvedValue([{
      id: "notice-1", title: "Event update", message: "The event is ready",
      sentAt: null, createdAt: new Date("2026-11-02T08:00:00Z"),
      priority: "normal", imageUrl: null, actionUrl: "/events",
    }])

    const response = await GET(new NextRequest("http://localhost/api/notifications"))

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({
      notifications: [{
        id: "notice-1", type: "push", title: "Event update", message: "The event is ready",
        isRead: false, createdAt: "2026-11-02T08:00:00.000Z",
        priority: "normal", imageUrl: null, actionUrl: "/events",
      }],
      unreadCount: 1,
    })
    expect(mockFindMany).toHaveBeenCalledWith({
      where: { status: "sent" }, orderBy: { sentAt: "desc" }, take: 50,
    })
  })
})
