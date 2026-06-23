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
import { CreditCard, Loader2, ShieldCheck } from "lucide-react";
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

  const handlePay = async () => {
    if (!summary || !paymentContext) return;
    if (!agreedToTerms) {
      setError("Please accept the terms and conditions to continue.");
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

    // Close app dialog first — Radix focus trap blocks Razorpay iframe inputs.
    onOpenChange(false);

    try {
      const verified = await openRazorpayCheckout({
        ...checkoutParams,
        paymentContext,
        onDismiss: () => setProcessing(false),
      });

      await onPaymentSuccess(verified.paymentTransactionId);

      setAgreedToTerms(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Payment failed";
      if (message !== "Payment cancelled") {
        setError(message);
      }
      // Re-open summary dialog so user can retry without re-selecting package.
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
      }
    }
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Complete Your Promotion Purchase</DialogTitle>
          <DialogDescription>
            Pay securely with Razorpay. Card, UPI, and netbanking are supported.
          </DialogDescription>
        </DialogHeader>

        {summary && (
          <div className="space-y-6">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <h3 className="mb-3 font-semibold">Order Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Package:</span>
                  <span className="font-medium">{summary.packageName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Event:</span>
                  <span className="font-medium">{summary.eventTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span>Target Categories:</span>
                  <span className="font-medium">{summary.categoryCount} selected</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Reach:</span>
                  <span className="font-medium">{summary.estimatedReach.toLocaleString()} users</span>
                </div>
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <span className="font-medium">{summary.duration}</span>
                </div>
                <div className="mt-2 border-t pt-2">
                  <div className="flex justify-between font-semibold">
                    <span>Total Amount:</span>
                    <span className="text-[#004A96]">{formatInr(summary.amountInr)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg border border-[#004A96]/20 bg-[#004A96]/5 p-4 text-sm">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#004A96]" />
              <div>
                <p className="font-medium text-gray-900">Secure payment via Razorpay</p>
                <p className="mt-1 text-gray-600">
                  You will be redirected to Razorpay&apos;s secure checkout. Test card: 4111 1111 1111 1111 ·
                  CVV 123 · Exp 12/26 · UPI: test@razorpay
                </p>
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Checkbox
                id={termsCheckboxId}
                checked={agreedToTerms}
                onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
                disabled={processing}
              />
              <Label htmlFor={termsCheckboxId} className="text-sm">
                I agree to the{" "}
                <a href="#" className={cn("text-[#004A96] hover:underline", linkClassName)}>
                  Terms and Conditions
                </a>{" "}
                and{" "}
                <a href="#" className={cn("text-[#004A96] hover:underline", linkClassName)}>
                  Promotion Policy
                </a>
              </Label>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={processing}>
                Cancel
              </Button>
              <Button
                className={payButtonClassName}
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
                    {payButtonLabel ?? `Pay ${formatInr(summary.amountInr)}`}
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
