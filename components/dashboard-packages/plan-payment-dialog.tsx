"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CreditCard, Crown, Loader2, ShieldCheck } from "lucide-react";
import type { DashboardPackageRole, DashboardPlanDefinition } from "@/lib/dashboard-packages";
import { openSubscriptionCheckout } from "@/lib/subscription-checkout";
import { getCurrentUserDisplayName, getCurrentUserEmail } from "@/lib/api";
import { cn } from "@/lib/utils";

type PlanPaymentDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: DashboardPackageRole;
  plan: DashboardPlanDefinition | null;
  onSuccess: () => void | Promise<void>;
};

function formatInr(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function PlanPaymentDialog({
  open,
  onOpenChange,
  role,
  plan,
  onSuccess,
}: PlanPaymentDialogProps) {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePay = () => {
    if (!plan || plan.priceInr <= 0) return;
    setError(null);
    setPaying(true);
    onOpenChange(false);

    void openSubscriptionCheckout({
      role,
      planSlug: plan.id,
      planName: plan.name,
      amountInr: plan.priceInr,
      prefill: {
        name: getCurrentUserDisplayName() ?? undefined,
        email: getCurrentUserEmail() ?? undefined,
      },
      onDismiss: () => setPaying(false),
    })
      .then(async () => {
        await onSuccess();
      })
      .catch((err) => {
        if (err instanceof Error && err.message !== "Payment cancelled") {
          setError(err.message);
          onOpenChange(true);
        }
      })
      .finally(() => setPaying(false));
  };

  if (!plan) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md gap-0 overflow-hidden p-0 sm:max-w-lg">
        <div className="border-b bg-gradient-to-br from-[#004A96]/10 via-white to-amber-50/40 px-6 py-5">
          <DialogHeader className="space-y-2 text-left">
            <div className="flex items-center gap-2 text-[#004A96]">
              <Crown className="h-5 w-5" aria-hidden />
              <span className="text-xs font-semibold uppercase tracking-wide">Upgrade plan</span>
            </div>
            <DialogTitle className="text-xl">{plan.name}</DialogTitle>
            <DialogDescription>{plan.tagline}</DialogDescription>
          </DialogHeader>
          <p className="mt-4 text-3xl font-bold text-gray-900">
            {formatInr(plan.priceInr)}
            {plan.billingNote ? (
              <span className="ml-1 text-sm font-medium text-gray-500">/ {plan.billingNote}</span>
            ) : null}
          </p>
        </div>

        <div className="space-y-4 px-6 py-5">
          <div className="flex items-start gap-3 rounded-lg border border-emerald-100 bg-emerald-50/60 px-3 py-3 text-sm text-emerald-900">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <p>Secure payment via Razorpay. Your plan activates immediately after successful payment.</p>
          </div>

          {error ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>
          ) : null}

          <div className="flex items-start gap-2">
            <Checkbox
              id="plan-terms"
              checked={termsAccepted}
              onCheckedChange={(v) => setTermsAccepted(v === true)}
            />
            <Label htmlFor="plan-terms" className="text-sm leading-snug text-gray-600">
              I agree to the plan terms and understand this is a {plan.billingNote || "one-time"} purchase in INR.
            </Label>
          </div>
        </div>

        <div className="flex gap-3 border-t bg-gray-50 px-6 py-4">
          <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            className={cn("flex-1 bg-[#004A96] text-white hover:bg-[#003d7a]")}
            disabled={!termsAccepted || paying}
            onClick={handlePay}
          >
            {paying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                Processing…
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" aria-hidden />
                Pay {formatInr(plan.priceInr)}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
