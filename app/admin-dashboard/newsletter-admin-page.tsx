"use client";

import { useCallback, useEffect, useState } from "react";
import adminApi from "@/lib/admin-api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Newspaper, Send, RefreshCw, Users } from "lucide-react";

type Subscriber = { id: string; email: string; status: string; source: string; createdAt: string };

type RecentEvent = {
  id: string;
  title: string;
  shortDescription: string | null;
  slug: string;
  startDate: string;
  endDate: string;
  city: string | null;
  country: string | null;
  venueName: string | null;
};

type Campaign = {
  id: string;
  subject: string;
  eventIds: string[];
  recipientCount: number;
  sentSucceeded: number;
  sentFailed: number;
  sentByEmail: string | null;
  createdAt: string;
};

export default function NewsletterAdminPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [subTotal, setSubTotal] = useState(0);
  const [events, setEvents] = useState<RecentEvent[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [subject, setSubject] = useState("Curated events from BizTradeFairs");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sendResult, setSendResult] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [subRes, evRes, campRes] = await Promise.all([
        adminApi<{ success?: boolean; data?: Subscriber[]; total?: number }>(
          "/newsletter/subscribers?limit=100&page=1",
        ),
        adminApi<{ success?: boolean; events?: RecentEvent[] }>("/newsletter/recent-events?limit=40"),
        adminApi<{ success?: boolean; campaigns?: Campaign[] }>("/newsletter/campaigns?limit=15"),
      ]);
      setSubscribers(Array.isArray(subRes.data) ? subRes.data : []);
      setSubTotal(typeof subRes.total === "number" ? subRes.total : 0);
      setEvents(Array.isArray(evRes.events) ? evRes.events : []);
      setCampaigns(Array.isArray(campRes.campaigns) ? campRes.campaigns : []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load newsletter data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function toggleEvent(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleSend() {
    const eventIds = [...selected];
    if (eventIds.length === 0) {
      setError("Select at least one event to include.");
      return;
    }
    setSending(true);
    setError(null);
    setSendResult(null);
    try {
      const res = await adminApi<{
        success?: boolean;
        error?: string;
        recipientCount?: number;
        sentSucceeded?: number;
        sentFailed?: number;
      }>("/newsletter/send", {
        method: "POST",
        body: { eventIds, subject: subject.trim() || undefined },
      });
      if (!res.success) {
        setError(typeof res.error === "string" ? res.error : "Send failed");
        return;
      }
      const rc = res.recipientCount ?? 0;
      const ok = res.sentSucceeded ?? 0;
      const fail = res.sentFailed ?? 0;
      setSendResult(`Sent to ${rc} subscriber(s): ${ok} delivered, ${fail} failed.`);
      setSelected(new Set());
      await load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Send failed");
    } finally {
      setSending(false);
    }
  }

  function formatWhen(iso: string) {
    try {
      return new Date(iso).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return iso;
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Newsletter</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Active subscribers receive one email each with the events you select below.
        </p>
      </div>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      {sendResult ? (
        <p className="text-sm text-green-700" role="status">
          {sendResult}
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5 text-sky-600" />
                Subscribers
              </CardTitle>
              <CardDescription>
                {loading ? "Loading…" : `${subTotal} active (showing ${subscribers.length})`}
              </CardDescription>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
              <RefreshCw className={`mr-1 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </CardHeader>
          <CardContent className="max-h-[320px] overflow-auto">
            {subscribers.length === 0 && !loading ? (
              <p className="text-sm text-muted-foreground">No subscribers yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead className="whitespace-nowrap">Since</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscribers.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-mono text-xs">{s.email}</TableCell>
                      <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                        {formatWhen(s.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Newspaper className="h-5 w-5 text-sky-600" />
              Compose send
            </CardTitle>
            <CardDescription>
              Choose published public events, then send one styled digest email per subscriber.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nl-subject">Email subject</Label>
              <Input
                id="nl-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                disabled={sending}
                maxLength={200}
              />
            </div>
            <div className="max-h-[280px] space-y-2 overflow-y-auto rounded-md border p-3">
              {events.length === 0 && !loading ? (
                <p className="text-sm text-muted-foreground">No published events found.</p>
              ) : (
                events.map((ev) => (
                  <label
                    key={ev.id}
                    className="flex cursor-pointer items-start gap-3 rounded-lg border border-transparent p-2 hover:bg-muted/50"
                  >
                    <Checkbox
                      checked={selected.has(ev.id)}
                      onCheckedChange={() => toggleEvent(ev.id)}
                      disabled={sending}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium leading-snug">{ev.title}</span>
                      <span className="text-muted-foreground block text-xs">
                        {formatWhen(ev.startDate)}
                        {ev.city || ev.country ? ` · ${[ev.city, ev.country].filter(Boolean).join(", ")}` : ""}
                      </span>
                    </span>
                  </label>
                ))
              )}
            </div>
            <Button
              type="button"
              className="w-full"
              onClick={() => void handleSend()}
              disabled={sending || selected.size === 0 || subTotal === 0}
            >
              <Send className="mr-2 h-4 w-4" />
              {sending ? "Sending…" : `Send to ${subTotal} subscriber(s)`}
            </Button>
            {subTotal === 0 ? (
              <p className="text-center text-xs text-muted-foreground">Nobody to email until someone subscribes from the site footer.</p>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent sends</CardTitle>
          <CardDescription>Last newsletter broadcasts from this dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          {campaigns.length === 0 ? (
            <p className="text-sm text-muted-foreground">No sends yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>When</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Recipients</TableHead>
                  <TableHead>OK / Fail</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                      {formatWhen(c.createdAt)}
                    </TableCell>
                    <TableCell className="max-w-[240px] truncate text-sm">{c.subject}</TableCell>
                    <TableCell>{c.recipientCount}</TableCell>
                    <TableCell className="text-sm">
                      {c.sentSucceeded} / {c.sentFailed}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
