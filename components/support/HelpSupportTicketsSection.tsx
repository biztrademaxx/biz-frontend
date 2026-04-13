"use client"

import { useState, useEffect, useCallback } from "react"
import { apiFetch } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Ticket, Loader2, MessageSquare } from "lucide-react"

type TicketRow = {
  id: string
  title: string
  description: string
  category: string
  priority: string
  status: string
  createdAt: string
  replies: Array<{
    id: string
    content: string
    createdAt: string
    user: { firstName: string; lastName: string; email: string }
  }>
}

export function HelpSupportTicketsSection() {
  const { toast } = useToast()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("general")
  const [priority, setPriority] = useState("MEDIUM")
  const [submitting, setSubmitting] = useState(false)
  const [mine, setMine] = useState<TicketRow[]>([])
  const [loadingMine, setLoadingMine] = useState(true)
  const [active, setActive] = useState<TicketRow | null>(null)
  const [replyText, setReplyText] = useState("")
  const [replying, setReplying] = useState(false)

  const loadMine = useCallback(async () => {
    try {
      setLoadingMine(true)
      const res = await apiFetch<{ success?: boolean; data?: TicketRow[] }>("/api/support/tickets", {
        auth: true,
      })
      const rows = Array.isArray(res.data) ? res.data : []
      setMine(rows)
    } catch {
      setMine([])
    } finally {
      setLoadingMine(false)
    }
  }, [])

  useEffect(() => {
    loadMine()
  }, [loadMine])

  const submitTicket = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !description.trim()) {
      toast({ title: "Missing fields", description: "Please add a title and description.", variant: "destructive" })
      return
    }
    setSubmitting(true)
    try {
      await apiFetch("/api/support/tickets", {
        method: "POST",
        body: { title: title.trim(), description: description.trim(), category, priority },
        auth: true,
      })
      toast({ title: "Ticket submitted", description: "Our team will review it shortly." })
      setTitle("")
      setDescription("")
      setCategory("general")
      setPriority("MEDIUM")
      loadMine()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Could not submit ticket"
      toast({ title: "Error", description: msg, variant: "destructive" })
    } finally {
      setSubmitting(false)
    }
  }

  const sendReply = async () => {
    if (!active || !replyText.trim()) return
    setReplying(true)
    try {
      await apiFetch(`/api/support/tickets/${active.id}/replies`, {
        method: "POST",
        body: { content: replyText.trim() },
        auth: true,
      })
      toast({ title: "Reply sent" })
      setReplyText("")
      setActive(null)
      loadMine()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to send reply"
      toast({ title: "Error", description: msg, variant: "destructive" })
    } finally {
      setReplying(false)
    }
  }

  const statusVariant = (s: string) => {
    if (s === "OPEN") return "destructive" as const
    if (s === "IN_PROGRESS") return "secondary" as const
    if (s === "RESOLVED") return "secondary" as const
    return "outline" as const
  }

  return (
    <section className="space-y-8">
      <Card className="border border-gray-100 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Ticket className="h-7 w-7 text-blue-600" />
            Raise a support ticket
          </CardTitle>
          <CardDescription>
            Describe your issue and we will route it to the admin team. You can track replies below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submitTicket} className="space-y-4 max-w-2xl">
            <div>
              <Label htmlFor="st-title">Subject</Label>
              <Input
                id="st-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Short summary"
                className="mt-1"
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="account">Account & login</SelectItem>
                    <SelectItem value="billing">Billing</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="event">Events & registration</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Priority</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="URGENT">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="st-desc">Details</Label>
              <Textarea
                id="st-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What happened? What did you expect?"
                rows={5}
                className="mt-1"
              />
            </div>
            <Button type="submit" disabled={submitting} className="min-w-[140px]">
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Sending…
                </>
              ) : (
                "Submit ticket"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border border-gray-100 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <MessageSquare className="h-6 w-6 text-blue-600" />
            My tickets
          </CardTitle>
          <CardDescription>Tickets you have raised from this account.</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingMine ? (
            <p className="text-sm text-muted-foreground py-4">Loading…</p>
          ) : mine.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2">No tickets yet.</p>
          ) : (
            <ul className="divide-y rounded-md border">
              {mine.map((t) => (
                <li key={t.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div>
                    <p className="font-medium">{t.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(t.createdAt).toLocaleString()} · {t.replies?.length ?? 0} replies
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={statusVariant(t.status)}>{t.status.replace("_", " ")}</Badge>
                    <Button type="button" variant="outline" size="sm" onClick={() => setActive(t)}>
                      View / reply
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{active?.title}</DialogTitle>
            <DialogDescription className="whitespace-pre-wrap">{active?.description}</DialogDescription>
          </DialogHeader>
          {active && (
            <div className="space-y-4">
              <div className="space-y-2 max-h-48 overflow-y-auto text-sm border rounded-md p-3 bg-muted/40">
                {(active.replies ?? []).map((r) => (
                  <div key={r.id} className="border-b border-border/60 pb-2 last:border-0">
                    <p className="text-xs text-muted-foreground mb-1">
                      {r.user.firstName} {r.user.lastName} · {new Date(r.createdAt).toLocaleString()}
                    </p>
                    <p>{r.content}</p>
                  </div>
                ))}
              </div>
              <div>
                <Label>Add a reply</Label>
                <Textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={4}
                  className="mt-1"
                  placeholder="Follow-up message…"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setActive(null)}>
                  Close
                </Button>
                <Button type="button" onClick={sendReply} disabled={replying || !replyText.trim()}>
                  {replying ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send reply"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  )
}
