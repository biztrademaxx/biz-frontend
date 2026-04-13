"use client";

import { useCallback, useEffect, useState } from "react";
import { adminApi } from "@/lib/admin-api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type DeactivationRow = {
  id: string;
  status: string;
  requestedAt: string;
  reviewedAt?: string | null;
  deactivateEffectiveAt?: string | null;
  rejectReason?: string | null;
  user: {
    id: string;
    email: string | null;
    firstName: string;
    lastName: string;
    role: string;
    phone?: string | null;
  };
};

export default function AccountDeactivationsPage() {
  const { toast } = useToast();
  const [pending, setPending] = useState<DeactivationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi<{ success: boolean; data: DeactivationRow[] }>(
        "/account-deactivations/pending"
      );
      setPending(res.data ?? []);
    } catch (e: any) {
      toast({
        title: "Failed to load requests",
        description: e?.message ?? "Unknown error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const approve = async (id: string) => {
    setActingId(id);
    try {
      await adminApi(`/account-deactivations/${id}/approve`, { method: "POST" });
      toast({
        title: "Approved",
        description: "User’s account will deactivate 30 days from approval.",
      });
      await load();
    } catch (e: any) {
      toast({
        title: "Approve failed",
        description: e?.message ?? "Unknown error",
        variant: "destructive",
      });
    } finally {
      setActingId(null);
    }
  };

  const reject = async (id: string) => {
    const reason = window.prompt("Optional reason for rejection (visible to ops only):") ?? "";
    setActingId(id);
    try {
      await adminApi(`/account-deactivations/${id}/reject`, {
        method: "POST",
        body: { reason: reason.trim() || undefined },
      });
      toast({ title: "Request rejected" });
      await load();
    } catch (e: any) {
      toast({
        title: "Reject failed",
        description: e?.message ?? "Unknown error",
        variant: "destructive",
      });
    } finally {
      setActingId(null);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Account deactivation requests</CardTitle>
          <CardDescription>
            When you approve, the user stays active until 30 days after approval; then the account is
            closed automatically. Reject to allow them to continue without scheduling closure.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Loading…</p>
          ) : pending.length === 0 ? (
            <p className="text-muted-foreground">No pending requests.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pending.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <div className="font-medium">
                        {row.user.firstName} {row.user.lastName}
                      </div>
                      <div className="text-sm text-muted-foreground">{row.user.email ?? "—"}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{row.user.role}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(row.requestedAt).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        size="sm"
                        variant="default"
                        disabled={actingId === row.id}
                        onClick={() => approve(row.id)}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={actingId === row.id}
                        onClick={() => reject(row.id)}
                      >
                        Reject
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          <div className="mt-4">
            <Button variant="secondary" size="sm" onClick={() => load()} disabled={loading}>
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
