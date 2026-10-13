"use client"

import { useCallback, useEffect, useState } from "react"
import { adminApi } from "@/lib/admin-api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { RefreshCw, Search } from "lucide-react"

type SearchQueryRow = {
  id: string
  normalizedQuery: string
  rawQuerySample: string | null
  resultCount: number
  hitCount: number
  zeroResultCount: number
  lastSeenAt: string
}

type SearchClickRow = {
  id: string
  queryNormalized: string | null
  eventId: string
  position: number | null
  page: number | null
  listingSource: string
  createdAt: string
}

type AnalyticsPayload = {
  success?: boolean
  days?: number
  totals?: { uniqueQueries: number; clicksInWindow: number }
  topQueries?: SearchQueryRow[]
  zeroResults?: SearchQueryRow[]
  recentClicks?: SearchClickRow[]
}

export default function SearchAnalyticsPanel() {
  const [data, setData] = useState<AnalyticsPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await adminApi<AnalyticsPayload>("/search/analytics?days=14&limit=25", {
        auth: true,
      })
      setData(res)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load search analytics")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold text-slate-900">
            <Search className="h-6 w-6" />
            Search Analytics
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Query demand, zero-result rates, and listing click-through (last {data?.days ?? 14} days).
          </p>
        </div>
        <Button variant="outline" onClick={() => void load()} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {error ? (
        <Card>
          <CardContent className="py-6 text-sm text-red-600">{error}</CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Unique queries</CardDescription>
            <CardTitle className="text-3xl">{data?.totals?.uniqueQueries ?? "—"}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Clicks in window</CardDescription>
            <CardTitle className="text-3xl">{data?.totals?.clicksInWindow ?? "—"}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top queries</CardTitle>
            <CardDescription>By hit count</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Query</TableHead>
                  <TableHead className="text-right">Hits</TableHead>
                  <TableHead className="text-right">Results</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data?.topQueries ?? []).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-slate-500">
                      {loading ? "Loading…" : "No search queries yet"}
                    </TableCell>
                  </TableRow>
                ) : (
                  (data?.topQueries ?? []).map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-medium">{row.normalizedQuery}</TableCell>
                      <TableCell className="text-right">{row.hitCount}</TableCell>
                      <TableCell className="text-right">{row.resultCount}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Zero-result queries</CardTitle>
            <CardDescription>Needs synonym / catalog coverage</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Query</TableHead>
                  <TableHead className="text-right">Zero hits</TableHead>
                  <TableHead className="text-right">Searches</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data?.zeroResults ?? []).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-slate-500">
                      {loading ? "Loading…" : "No zero-result queries"}
                    </TableCell>
                  </TableRow>
                ) : (
                  (data?.zeroResults ?? []).map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-medium">{row.normalizedQuery}</TableCell>
                      <TableCell className="text-right">{row.zeroResultCount}</TableCell>
                      <TableCell className="text-right">{row.hitCount}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent clicks</CardTitle>
          <CardDescription>Listing / navbar result CTR samples</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>When</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Query</TableHead>
                <TableHead>Event</TableHead>
                <TableHead className="text-right">Pos</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data?.recentClicks ?? []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-slate-500">
                    {loading ? "Loading…" : "No clicks recorded yet"}
                  </TableCell>
                </TableRow>
              ) : (
                (data?.recentClicks ?? []).map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="whitespace-nowrap text-sm">
                      {new Date(row.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell>{row.listingSource}</TableCell>
                    <TableCell>{row.queryNormalized || "—"}</TableCell>
                    <TableCell className="font-mono text-xs">{row.eventId.slice(0, 8)}…</TableCell>
                    <TableCell className="text-right">{row.position ?? "—"}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
