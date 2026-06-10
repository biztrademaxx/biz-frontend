"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import adminApi from "@/lib/admin-api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CalendarRange, Filter, Newspaper, Send, RefreshCw, Users } from "lucide-react";

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
  category: string[];
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

type EventCategory = { id: string; name: string };

type DateWindow = "all" | "30d" | "2m" | "3m" | "5m" | "8m" | "1y";
type Audience = "subscribers" | "visitors" | "both";

const DATE_WINDOWS: { value: DateWindow; label: string }[] = [
  { value: "all", label: "All upcoming events" },
  { value: "30d", label: "Starting within 30 days" },
  { value: "2m", label: "Starting within 2 months" },
  { value: "3m", label: "Starting within 3 months" },
  { value: "5m", label: "Starting within 5 months" },
  { value: "8m", label: "Starting within 8 months" },
  { value: "1y", label: "Starting within 1 year" },
];

const AUDIENCE_OPTIONS: { value: Audience; label: string; description: string }[] = [
  {
    value: "both",
    label: "Subscribers + visitors",
    description: "Footer newsletter signups and registered visitors with email notifications on.",
  },
  {
    value: "subscribers",
    label: "Newsletter subscribers only",
    description: "People who subscribed from the site footer.",
  },
  {
    value: "visitors",
    label: "Visitors only",
    description: "Registered visitors (attendees) with email notifications enabled.",
  },
];

export default function NewsletterAdminPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [subTotal, setSubTotal] = useState(0);
  const [events, setEvents] = useState<RecentEvent[]>([]);
  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [subject, setSubject] = useState("Curated events from BizTradeFairs");
  const [dateWindow, setDateWindow] = useState<DateWindow>("3m");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [audience, setAudience] = useState<Audience>("both");
  const [personalized, setPersonalized] = useState(true);
  const [recipientPreview, setRecipientPreview] = useState({
    total: 0,
    subscribers: 0,
    visitors: 0,
  });
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sendResult, setSendResult] = useState<string | null>(null);
  const filtersReady = useRef(false);

  const loadEvents = useCallback(async () => {
    const params = new URLSearchParams({ limit: "80", window: dateWindow });
    if (categoryFilter !== "all") params.set("category", categoryFilter);
    const evRes = await adminApi<{ success?: boolean; events?: RecentEvent[] }>(
      `/newsletter/recent-events?${params.toString()}`,
    );
    const list = Array.isArray(evRes.events) ? evRes.events : [];
    setEvents(list);
    setSelected((prev) => {
      const valid = new Set(list.map((e) => e.id));
      return new Set([...prev].filter((id) => valid.has(id)));
    });
  }, [dateWindow, categoryFilter]);

  const loadRecipientPreview = useCallback(async () => {
    const params = new URLSearchParams({
      audience,
      personalized: String(personalized),
    });
    if (categoryFilter !== "all") params.set("category", categoryFilter);
    const res = await adminApi<{
      success?: boolean;
      total?: number;
      subscribers?: number;
      visitors?: number;
    }>(`/newsletter/recipient-preview?${params.toString()}`);
    setRecipientPreview({
      total: res.total ?? 0,
      subscribers: res.subscribers ?? 0,
      visitors: res.visitors ?? 0,
    });
  }, [audience, categoryFilter, personalized]);

  const loadStatic = useCallback(async () => {
    const [subRes, catRes, campRes] = await Promise.all([
      adminApi<{ success?: boolean; data?: Subscriber[]; total?: number }>(
        "/newsletter/subscribers?limit=100&page=1",
      ),
      adminApi<{ success?: boolean; categories?: EventCategory[] }>("/newsletter/categories"),
      adminApi<{ success?: boolean; campaigns?: Campaign[] }>("/newsletter/campaigns?limit=15"),
    ]);
    setSubscribers(Array.isArray(subRes.data) ? subRes.data : []);
    setSubTotal(typeof subRes.total === "number" ? subRes.total : 0);
    setCategories(Array.isArray(catRes.categories) ? catRes.categories : []);
    setCampaigns(Array.isArray(campRes.campaigns) ? campRes.campaigns : []);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([loadStatic(), loadEvents(), loadRecipientPreview()]);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load newsletter data");
    } finally {
      setLoading(false);
    }
  }, [loadStatic, loadEvents, loadRecipientPreview]);

  useEffect(() => {
    void load().finally(() => {
      filtersReady.current = true;
    });
  }, [load]);

  useEffect(() => {
    if (!filtersReady.current) return;
    void (async () => {
      try {
        await Promise.all([loadEvents(), loadRecipientPreview()]);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Failed to refresh filters");
      }
    })();
  }, [dateWindow, categoryFilter, audience, personalized, loadEvents, loadRecipientPreview]);

  function toggleEvent(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAllVisible() {
    setSelected(new Set(events.map((e) => e.id)));
  }

  function clearSelection() {
    setSelected(new Set());
  }

  async function handleSend() {
    const eventIds = [...selected];
    if (eventIds.length === 0) {
      setError("Select at least one event to include.");
      return;
    }
    if (recipientPreview.total === 0) {
      setError("No recipients match your audience and category filters.");
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
        skippedNoMatch?: number;
      }>("/newsletter/send", {
        method: "POST",
        body: {
          eventIds,
          subject: subject.trim() || undefined,
          audience,
          category: categoryFilter !== "all" ? categoryFilter : undefined,
          personalized,
        },
      });
      if (!res.success) {
        setError(typeof res.error === "string" ? res.error : "Send failed");
        return;
      }
      const rc = res.recipientCount ?? 0;
      const ok = res.sentSucceeded ?? 0;
      const fail = res.sentFailed ?? 0;
      const skipped = res.skippedNoMatch ?? 0;
      setSendResult(
        `Queued for ${rc} recipient(s): ${ok} delivered, ${fail} failed` +
          (skipped > 0 ? `, ${skipped} skipped (no matching events for their interests).` : "."),
      );
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

  const windowLabel = DATE_WINDOWS.find((w) => w.value === dateWindow)?.label ?? dateWindow;

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Newsletter</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Filter upcoming events by start date, target visitors by category interest, and send a styled
          digest to newsletter subscribers and/or visitors.
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

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5 text-sky-600" />
                Audience
              </CardTitle>
              <CardDescription>
                {loading
                  ? "Loading…"
                  : `${recipientPreview.total} recipient(s) — ${recipientPreview.subscribers} subscriber(s), ${recipientPreview.visitors} visitor(s)`}
              </CardDescription>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
              <RefreshCw className={`mr-1 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Send to</Label>
              <Select value={audience} onValueChange={(v) => setAudience(v as Audience)} disabled={sending}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AUDIENCE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {AUDIENCE_OPTIONS.find((o) => o.value === audience)?.description}
              </p>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <Filter className="h-3.5 w-3.5" />
                Visitor category interest
              </Label>
              <Select
                value={categoryFilter}
                onValueChange={setCategoryFilter}
                disabled={sending}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.name}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                When set, only visitors interested in this category are included. Footer subscribers are
                included only when category is &quot;All&quot;.
              </p>
            </div>

            <label className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 hover:bg-muted/40">
              <Checkbox
                checked={personalized}
                onCheckedChange={(v) => setPersonalized(v === true)}
                disabled={sending}
              />
              <span className="space-y-0.5">
                <span className="block text-sm font-medium">Personalize by visitor interests</span>
                <span className="text-muted-foreground block text-xs">
                  Each visitor only receives selected events that match their profile interests. Visitors
                  without interests are skipped.
                </span>
              </span>
            </label>

            <div className="max-h-[200px] overflow-auto rounded-md border">
              {subscribers.length === 0 && !loading ? (
                <p className="p-3 text-sm text-muted-foreground">No footer subscribers yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subscriber email</TableHead>
                      <TableHead className="whitespace-nowrap">Since</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subscribers.slice(0, 8).map((s) => (
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
              {subTotal > 8 ? (
                <p className="border-t px-3 py-2 text-xs text-muted-foreground">
                  +{subTotal - 8} more subscriber(s)
                </p>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Newspaper className="h-5 w-5 text-sky-600" />
              Compose send
            </CardTitle>
            <CardDescription>
              Filter events, select which to include, then send one digest per recipient.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
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
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  <CalendarRange className="h-3.5 w-3.5" />
                  Event start window
                </Label>
                <Select
                  value={dateWindow}
                  onValueChange={(v) => setDateWindow(v as DateWindow)}
                  disabled={sending}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DATE_WINDOWS.map((w) => (
                      <SelectItem key={w.value} value={w.value}>
                        {w.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <span className="text-muted-foreground">
                {loading ? "Loading events…" : `${events.length} event(s) — ${windowLabel}`}
                {categoryFilter !== "all" ? ` · ${categoryFilter}` : ""}
              </span>
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={selectAllVisible} disabled={sending || events.length === 0}>
                  Select all
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={clearSelection} disabled={sending || selected.size === 0}>
                  Clear
                </Button>
              </div>
            </div>

            <div className="max-h-[320px] space-y-2 overflow-y-auto rounded-md border p-3">
              {events.length === 0 && !loading ? (
                <p className="text-sm text-muted-foreground">
                  No published events match this date window
                  {categoryFilter !== "all" ? " and category" : ""}.
                </p>
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
                        Starts {formatWhen(ev.startDate)}
                        {ev.city || ev.country ? ` · ${[ev.city, ev.country].filter(Boolean).join(", ")}` : ""}
                      </span>
                      {ev.category?.length > 0 ? (
                        <span className="mt-1 flex flex-wrap gap-1">
                          {ev.category.slice(0, 3).map((cat) => (
                            <Badge key={cat} variant="secondary" className="text-[10px] font-normal">
                              {cat}
                            </Badge>
                          ))}
                        </span>
                      ) : null}
                    </span>
                  </label>
                ))
              )}
            </div>

            <Button
              type="button"
              className="w-full"
              onClick={() => void handleSend()}
              disabled={sending || selected.size === 0 || recipientPreview.total === 0}
            >
              <Send className="mr-2 h-4 w-4" />
              {sending
                ? "Sending…"
                : `Send ${selected.size} event(s) to ${recipientPreview.total} recipient(s)`}
            </Button>
            {recipientPreview.total === 0 ? (
              <p className="text-center text-xs text-muted-foreground">
                Adjust audience or category filters to find recipients.
              </p>
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
