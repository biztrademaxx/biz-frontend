"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { adminApi } from "@/lib/admin-api"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { adminCardShell, adminPrimaryBtn } from "./admin-dashboard-theme"
import {
  Target,
  Clock,
  CheckCircle,
  TrendingUp,
  XCircle,
  ArrowRight,
  Building2,
  Store,
} from "lucide-react"

type PromotionStatus = "PENDING" | "APPROVED" | "REJECTED" | "ACTIVE" | "EXPIRED" | string

interface OrganizerPromotion {
  id: string
  organizer?: {
    organizationName?: string
    firstName?: string
    lastName?: string
    email?: string
  }
  event?: { id: string; title: string }
  packageType: string
  status: PromotionStatus
  amount: number
  createdAt: string
}

interface ExhibitorPromotion {
  id: string
  exhibitor?: {
    company?: string
    firstName?: string
    lastName?: string
    email?: string
  }
  event?: { id: string; title: string }
  packageType: string
  status: PromotionStatus
  amount: number
  createdAt: string
}

interface PromotionsDashboardProps {
  onNavigate?: (subId: string) => void
}

function countByStatus(items: { status: PromotionStatus }[], status: string) {
  return items.filter((item) => item.status === status).length
}

export default function PromotionsDashboard({ onNavigate }: PromotionsDashboardProps) {
  const [organizerPromotions, setOrganizerPromotions] = useState<OrganizerPromotion[]>([])
  const [exhibitorPromotions, setExhibitorPromotions] = useState<ExhibitorPromotion[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const [organizerData, exhibitorData] = await Promise.all([
          adminApi<{ promotions?: OrganizerPromotion[] }>("/organizers/promotions"),
          adminApi<ExhibitorPromotion[]>("/exhibitors/promotions"),
        ])
        setOrganizerPromotions(organizerData.promotions ?? [])
        setExhibitorPromotions(Array.isArray(exhibitorData) ? exhibitorData : [])
      } catch (error) {
        console.error("Failed to load promotions dashboard:", error)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const allPromotions = useMemo(() => {
    const organizerRows = organizerPromotions.map((p) => ({
      ...p,
      source: "Organizer" as const,
      name:
        p.organizer?.organizationName ||
        [p.organizer?.firstName, p.organizer?.lastName].filter(Boolean).join(" ") ||
        "Unknown organizer",
      email: p.organizer?.email ?? "",
    }))
    const exhibitorRows = exhibitorPromotions.map((p) => ({
      ...p,
      source: "Exhibitor" as const,
      name:
        p.exhibitor?.company ||
        [p.exhibitor?.firstName, p.exhibitor?.lastName].filter(Boolean).join(" ") ||
        "Unknown exhibitor",
      email: p.exhibitor?.email ?? "",
    }))
    return [...organizerRows, ...exhibitorRows].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
  }, [organizerPromotions, exhibitorPromotions])

  const stats = useMemo(
    () => ({
      total: allPromotions.length,
      pending: countByStatus(allPromotions, "PENDING"),
      approved: countByStatus(allPromotions, "APPROVED"),
      active: countByStatus(allPromotions, "ACTIVE"),
      rejected: countByStatus(allPromotions, "REJECTED"),
      organizerTotal: organizerPromotions.length,
      exhibitorTotal: exhibitorPromotions.length,
    }),
    [allPromotions, organizerPromotions.length, exhibitorPromotions.length],
  )

  const recentPromotions = allPromotions.slice(0, 10)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Promotions Dashboard</h1>
        <p className="mt-2 text-slate-600">
          Overview of organizer and exhibitor promotion requests across the platform
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className={adminCardShell}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Requests</CardTitle>
            <Target className="h-4 w-4 text-[#004A96]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.organizerTotal} organizer · {stats.exhibitorTotal} exhibitor
            </p>
          </CardContent>
        </Card>

        <Card className={adminCardShell}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card className={adminCardShell}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Active</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
          </CardContent>
        </Card>

        <Card className={adminCardShell}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approved}</div>
            {stats.rejected > 0 && (
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <XCircle className="h-3 w-3 text-red-500" />
                {stats.rejected} rejected
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className={adminCardShell}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <Building2 className="h-5 w-5 text-[#004A96]" />
              Organizer Promotions
            </CardTitle>
            <CardDescription>Event promotion requests submitted by organizers</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold">{stats.organizerTotal}</p>
              <p className="text-sm text-muted-foreground">
                {countByStatus(organizerPromotions, "PENDING")} pending review
              </p>
            </div>
            <Button variant="outline" className="border-[#004A96]/30 text-[#004A96] hover:bg-[#004A96]/5" onClick={() => onNavigate?.("promotions")}>
              Manage
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        <Card className={adminCardShell}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <Store className="h-5 w-5 text-[#004A96]" />
              Exhibitor Promotions
            </CardTitle>
            <CardDescription>Promotion requests from exhibitors</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold">{stats.exhibitorTotal}</p>
              <p className="text-sm text-muted-foreground">
                {countByStatus(exhibitorPromotions, "PENDING")} pending review
              </p>
            </div>
            <Button variant="outline" className="border-[#004A96]/30 text-[#004A96] hover:bg-[#004A96]/5" onClick={() => onNavigate?.("exhibitors-promotions")}>
              Manage
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className={adminCardShell}>
        <CardHeader>
          <CardTitle className="text-slate-900">Recent Promotion Requests</CardTitle>
          <CardDescription>Latest organizer and exhibitor promotion submissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Source</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Package</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Loading promotions...
                    </TableCell>
                  </TableRow>
                ) : recentPromotions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No promotion requests yet
                    </TableCell>
                  </TableRow>
                ) : (
                  recentPromotions.map((promotion) => (
                    <TableRow key={`${promotion.source}-${promotion.id}`}>
                      <TableCell>
                        <Badge variant="outline">{promotion.source}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{promotion.name}</div>
                        {promotion.email && (
                          <div className="text-xs text-muted-foreground">{promotion.email}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        {promotion.event?.title ? (
                          <span className="text-sm">{promotion.event.title}</span>
                        ) : (
                          <span className="text-xs text-muted-foreground">No event linked</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{promotion.packageType}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">${promotion.amount}</TableCell>
                      <TableCell>
                        <Badge
                          className={cn(
                            promotion.status === "PENDING"
                              ? "border-amber-200 bg-amber-50 text-amber-800"
                              : promotion.status === "ACTIVE"
                                ? "bg-[#004A96] text-white"
                                : "",
                          )}
                          variant={promotion.status === "PENDING" ? "outline" : "default"}
                        >
                          {promotion.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(promotion.createdAt), "MMM dd, yyyy")}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
