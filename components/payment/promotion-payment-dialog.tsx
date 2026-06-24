"use client";

import { useState, type ComponentType } from "react";
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
import {
  CreditCard,
  Loader2,
  ShieldCheck,
  Package,
  CalendarDays,
  Target,
  Users,
  Megaphone,
} from "lucide-react";
import { openRazorpayCheckout, type PromotionPaymentContext } from "@/lib/razorpay-checkout";
import { getCurrentUserDisplayName, getCurrentUserEmail } from "@/lib/api";
import { cn } from "@/lib/utils";

export type PromotionOrderSummary = {
  packageName: string;
  eventTitle: string;
  categoryCount: number;
  estimatedReach: number;
  duration: string;
  amountInr: number;
};

type PromotionPaymentDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  summary: PromotionOrderSummary | null;
  paymentContext: PromotionPaymentContext | null;
  receiptPrefix: string;
  onPaymentSuccess: (paymentTransactionId: string) => Promise<void>;
  payButtonClassName?: string;
  linkClassName?: string;
  termsCheckboxId?: string;
  payButtonLabel?: string;
};

function formatInr(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

function SummaryRow({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg bg-white/80 px-3 py-2.5">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#004A96]/10 text-[#004A96]">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
        <p className="mt-0.5 text-sm font-semibold text-slate-900">{value}</p>
      </div>
    </div>
  );
}

export function PromotionPaymentDialog({
  open,
  onOpenChange,
  summary,
  paymentContext,
  receiptPrefix,
  onPaymentSuccess,
  payButtonClassName,
  linkClassName,
  termsCheckboxId = "promotion-terms",
  payButtonLabel,
}: PromotionPaymentDialogProps) {
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingPaymentId, setPendingPaymentId] = useState<string | null>(null);

  const handlePay = async () => {
    if (!summary || !paymentContext) return;
    if (!agreedToTerms) {
      setError("Please accept the terms and conditions to continue.");
      return;
    }

    setError(null);
    setProcessing(true);

    if (pendingPaymentId) {
      try {
        await onPaymentSuccess(pendingPaymentId);
        setPendingPaymentId(null);
        setAgreedToTerms(false);
        onOpenChange(false);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to activate promotion";
        setError(`${message} Your payment was received — you can retry without paying again.`);
      } finally {
        setProcessing(false);
      }
      return;
    }

    const checkoutParams = {
      amountInr: summary.amountInr,
      receipt: `${receiptPrefix}_${Date.now()}`,
      description: `${summary.packageName} — ${summary.eventTitle}`,
      businessName: "BizTradeFairs Promotions",
      prefill: {
        name: getCurrentUserDisplayName(),
        email: getCurrentUserEmail() ?? undefined,
      },
    };

    setError(null);
    setProcessing(true);
    onOpenChange(false);

    try {
      const verified = await openRazorpayCheckout({
        ...checkoutParams,
        paymentContext,
        onDismiss: () => setProcessing(false),
      });

      try {
        await onPaymentSuccess(verified.paymentTransactionId);
        setPendingPaymentId(null);
        setAgreedToTerms(false);
      } catch (activateErr) {
        setPendingPaymentId(verified.paymentTransactionId);
        const message =
          activateErr instanceof Error ? activateErr.message : "Failed to activate promotion";
        setError(`${message} Your payment was received — click Retry activation below.`);
        onOpenChange(true);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Payment failed";
      if (message !== "Payment cancelled") {
        setError(message);
      }
      onOpenChange(true);
    } finally {
      setProcessing(false);
    }
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setError(null);
      if (!processing) {
        setAgreedToTerms(false);
        setPendingPaymentId(null);
      }
    }
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg gap-0 overflow-hidden p-0 sm:max-w-xl">
        <div className="border-b border-slate-200 bg-gradient-to-br from-[#004A96] to-[#003670] px-6 py-5 text-white">
          <DialogHeader className="space-y-1 text-left">
            <DialogTitle className="text-xl font-semibold text-white">
              Complete Your Promotion Purchase
            </DialogTitle>
            <DialogDescription className="text-sm text-blue-100">
              Pay securely with Razorpay — cards, UPI, and netbanking supported.
            </DialogDescription>
          </DialogHeader>
        </div>

        {summary && (
          <div className="space-y-5 px-6 py-5">
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white shadow-sm">
              <div className="flex items-center gap-2 border-b border-slate-200 bg-white px-4 py-3">
                <Megaphone className="h-4 w-4 text-[#004A96]" />
                <h3 className="text-sm font-semibold text-slate-900">Order Summary</h3>
              </div>

              <div className="space-y-2 p-3">
                <SummaryRow icon={Package} label="Package" value={summary.packageName} />
                <SummaryRow icon={CalendarDays} label="Event" value={summary.eventTitle} />
                <SummaryRow
                  icon={Target}
                  label="Target Categories"
                  value={`${summary.categoryCount} selected`}
                />
                <SummaryRow
                  icon={Users}
                  label="Estimated Reach"
                  value={`${summary.estimatedReach.toLocaleString()} users`}
                />
                <SummaryRow icon={CalendarDays} label="Duration" value={summary.duration} />
              </div>

              <div className="flex items-center justify-between border-t border-dashed border-slate-200 bg-[#004A96]/5 px-4 py-4">
                <span className="text-sm font-medium text-slate-600">Total payable</span>
                <span className="text-2xl font-bold tracking-tight text-[#004A96]">
                  {formatInr(summary.amountInr)}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-emerald-200/80 bg-emerald-50/80 px-4 py-3 text-sm">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
              <div>
                <p className="font-medium text-emerald-900">Secured by Razorpay</p>
                <p className="mt-1 text-emerald-800/80">
                  You&apos;ll complete payment on Razorpay&apos;s encrypted checkout page.
                </p>
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
              >
                {error}
              </div>
            )}

            <div className="flex items-start gap-2">
              <Checkbox
                id={termsCheckboxId}
                checked={agreedToTerms}
                onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
                disabled={processing}
                className="mt-0.5"
              />
              <Label htmlFor={termsCheckboxId} className="text-sm leading-relaxed text-slate-600">
                I agree to the{" "}
                <a href="#" className={cn("font-medium text-[#004A96] hover:underline", linkClassName)}>
                  Terms and Conditions
                </a>{" "}
                and{" "}
                <a href="#" className={cn("font-medium text-[#004A96] hover:underline", linkClassName)}>
                  Promotion Policy
                </a>
              </Label>
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end sm:gap-3">
              <Button
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={processing}
                className="sm:min-w-[100px]"
              >
                Cancel
              </Button>
              <Button
                className={cn("bg-[#004A96] hover:bg-[#003670] sm:min-w-[180px]", payButtonClassName)}
                onClick={handlePay}
                disabled={processing || !agreedToTerms}
              >
                {processing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    {pendingPaymentId
                      ? "Retry activation"
                      : payButtonLabel ?? `Pay ${formatInr(summary.amountInr)}`}
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
