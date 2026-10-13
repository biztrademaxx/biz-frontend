"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Mail, RefreshCw } from "lucide-react";

export type ContactInquiryRow = {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  inquiryType: string;
  message: string;
  thankYouSent: boolean;
  createdAt: string;
};

export default function ContactInquiriesPage() {
  const [rows, setRows] = useState<ContactInquiryRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<ContactInquiryRow | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<{
        success?: boolean;
        data?: ContactInquiryRow[];
        total?: number;
      }>("/api/admin/contact-inquiries?limit=200", { auth: true });
      setRows(Array.isArray(res.data) ? res.data : []);
      setTotal(typeof res.total === "number" ? res.total : 0);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load inquiries");
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <Card>
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4 space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Mail className="h-5 w-5 text-sky-600" />
              Contact inquiries
            </CardTitle>
            <CardDescription>
              Messages from the public &quot;Contact us&quot; form. {total > 0 ? `${total} total.` : ""}
            </CardDescription>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">No inquiries yet.</p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Thank-you sent</TableHead>
                    <TableHead className="text-right">Message</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {new Date(r.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell className="font-medium">{r.fullName}</TableCell>
                      <TableCell>
                        <a className="text-sky-600 underline hover:text-sky-800" href={`mailto:${r.email}`}>
                          {r.email}
                        </a>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{r.inquiryType}</Badge>
                      </TableCell>
                      <TableCell>{r.thankYouSent ? "Yes" : "No"}</TableCell>
                      <TableCell className="text-right">
                        <Button type="button" variant="ghost" size="sm" onClick={() => setSelected(r)}>
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{selected?.fullName}</DialogTitle>
            <DialogDescription>
              {selected?.email}
              {selected?.phone ? ` · ${selected.phone}` : ""}
            </DialogDescription>
          </DialogHeader>
          {selected ? (
            <div className="space-y-3 text-sm">
              <div>
                <span className="font-medium text-foreground">Inquiry type:</span> {selected.inquiryType}
              </div>
              <div>
                <span className="font-medium text-foreground">Submitted:</span>{" "}
                {new Date(selected.createdAt).toLocaleString()}
              </div>
              <div className="rounded-md border bg-muted/40 p-3 whitespace-pre-wrap">{selected.message}</div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
