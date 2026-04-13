"use client"

import { useEffect, useMemo, useState } from "react"
import { Search, Trash2 } from "lucide-react"
import { apiFetch } from "@/lib/api"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type SeoKeyword = {
  id: string
  keyword: string
  intent: "brand" | "event" | "location" | "long-tail"
  volume: number
  difficulty: number
  priority: "low" | "medium" | "high"
  updatedAt: string
}

export default function SeoKeywordsPanel() {
  const [keywords, setKeywords] = useState<SeoKeyword[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("")
  const [newKeyword, setNewKeyword] = useState("")
  const [intent, setIntent] = useState<SeoKeyword["intent"]>("long-tail")
  const [priority, setPriority] = useState<SeoKeyword["priority"]>("medium")
  const [volume, setVolume] = useState("0")
  const [difficulty, setDifficulty] = useState("0")

  const load = async () => {
    setLoading(true)
    try {
      const res = await apiFetch<{ success?: boolean; data?: SeoKeyword[] }>("/api/admin/marketing/seo-keywords", {
        auth: true,
      })
      setKeywords(res.success && Array.isArray(res.data) ? res.data : [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = useMemo(
    () => keywords.filter((k) => k.keyword.toLowerCase().includes(filter.trim().toLowerCase())),
    [keywords, filter],
  )

  const onCreate = async () => {
    if (!newKeyword.trim()) return
    const res = await apiFetch<{ success?: boolean; data?: SeoKeyword }>("/api/admin/marketing/seo-keywords", {
      method: "POST",
      body: {
        keyword: newKeyword.trim(),
        intent,
        priority,
        volume: Number(volume || 0),
        difficulty: Number(difficulty || 0),
      },
      auth: true,
    })
    if (res.success && res.data) {
      setKeywords((prev) => [res.data!, ...prev])
      setNewKeyword("")
      setVolume("0")
      setDifficulty("0")
    }
  }

  const onDelete = async (id: string) => {
    await apiFetch<{ success?: boolean }>(`/api/admin/marketing/seo-keywords/${id}`, { method: "DELETE", auth: true })
    setKeywords((prev) => prev.filter((k) => k.id !== id))
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">SEO & Keywords</h1>
        <p className="mt-1 text-gray-600">Track and prioritize search terms for content and campaign planning.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add keyword</CardTitle>
          <CardDescription>Create a new tracked query for your SEO backlog.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-6">
          <div className="md:col-span-2">
            <Label>Keyword</Label>
            <Input value={newKeyword} onChange={(e) => setNewKeyword(e.target.value)} placeholder="e.g. trade fairs in dubai" />
          </div>
          <div>
            <Label>Intent</Label>
            <Select value={intent} onValueChange={(v) => setIntent(v as SeoKeyword["intent"])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="brand">Brand</SelectItem>
                <SelectItem value="event">Event</SelectItem>
                <SelectItem value="location">Location</SelectItem>
                <SelectItem value="long-tail">Long-tail</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Priority</Label>
            <Select value={priority} onValueChange={(v) => setPriority(v as SeoKeyword["priority"])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Volume</Label>
            <Input type="number" value={volume} onChange={(e) => setVolume(e.target.value)} />
          </div>
          <div>
            <Label>Difficulty</Label>
            <Input type="number" max={100} min={0} value={difficulty} onChange={(e) => setDifficulty(e.target.value)} />
          </div>
          <div className="md:col-span-6">
            <Button className="gap-2" onClick={onCreate}>
              <Search className="h-4 w-4" />
              Add Keyword
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tracked keywords ({filtered.length})</CardTitle>
          <CardDescription>Manage queries used by content and campaign teams.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Filter keywords..." />
          {loading ? (
            <p className="text-sm text-gray-600">Loading keywords...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Keyword</TableHead>
                  <TableHead>Intent</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Volume</TableHead>
                  <TableHead>Difficulty</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((k) => (
                  <TableRow key={k.id}>
                    <TableCell className="font-medium">{k.keyword}</TableCell>
                    <TableCell><Badge variant="outline">{k.intent}</Badge></TableCell>
                    <TableCell><Badge>{k.priority}</Badge></TableCell>
                    <TableCell>{k.volume.toLocaleString()}</TableCell>
                    <TableCell>{k.difficulty}%</TableCell>
                    <TableCell>{new Date(k.updatedAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => onDelete(k.id)} className="text-red-600 bg-transparent">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-gray-500">
                      No keywords found.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
