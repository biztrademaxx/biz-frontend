"use client";

import { getAccessToken } from "@/lib/api";
import {
  inrToPaise,
  loadRazorpayScript,
  waitForCheckoutOverlayCleanup,
  type RazorpayPaymentResponse,
} from "@/lib/razorpay-checkout";
import type { CurrentDashboardPlan, DashboardPackageRole } from "@/lib/dashboard-packages";

function authHeaders(): HeadersInit {
  const token = getAccessToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

export async function fetchCurrentDashboardPlan(
  role: DashboardPackageRole,
): Promise<CurrentDashboardPlan> {
  const response = await fetch(`/api/subscriptions/current?role=${encodeURIComponent(role)}`, {
    headers: authHeaders(),
    cache: "no-store",
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message ?? "Failed to load current plan");
  }
  return data as CurrentDashboardPlan;
}

export async function activateFreeDashboardPlan(role: DashboardPackageRole, planSlug: string) {
  const response = await fetch("/api/subscriptions/activate-free", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ role, planSlug }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message ?? "Failed to activate plan");
  }
  return data;
}

async function createSubscriptionOrder(role: DashboardPackageRole, planSlug: string) {
  const response = await fetch("/api/subscriptions/create-order", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ role, planSlug }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message ?? "Failed to create payment order");
  }
  return data as {
    order_id: string;
    amount: number;
    currency: string;
    payment_transaction_id: string;
    plan: { name: string; amountInr: number };
  };
}

async function verifyPayment(payment: RazorpayPaymentResponse) {
  const response = await fetch("/api/verify-payment", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payment),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.success) {
    throw new Error(data.message ?? "Payment verification failed");
  }
  return {
    paymentTransactionId: data.payment_transaction_id as string,
  };
}

async function activatePaidSubscription(paymentTransactionId: string) {
  const response = await fetch("/api/subscriptions/activate", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ paymentTransactionId }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message ?? "Failed to activate subscription after payment");
  }
  return data;
}

export type OpenSubscriptionCheckoutParams = {
  role: DashboardPackageRole;
  planSlug: string;
  planName: string;
  amountInr: number;
  businessName?: string;
  prefill?: { name?: string; email?: string; contact?: string };
  onDismiss?: () => void;
  delayBeforeOpenMs?: number;
};

/** Razorpay checkout for dashboard plan upgrade, then activate subscription on backend. */
export async function openSubscriptionCheckout(params: OpenSubscriptionCheckoutParams) {
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  if (!keyId) {
    throw new Error("Payment gateway is not configured. Contact support.");
  }
  if (!getAccessToken()) {
    throw new Error("Please log in to complete payment.");
  }

  const loaded = await loadRazorpayScript();
  if (!loaded || !window.Razorpay) {
    throw new Error("Failed to load Razorpay checkout. Please try again.");
  }

  await waitForCheckoutOverlayCleanup(params.delayBeforeOpenMs ?? 400);

  const order = await createSubscriptionOrder(params.role, params.planSlug);

  return new Promise<{ paymentTransactionId: string }>((resolve, reject) => {
    const rzp = new window.Razorpay!({
      key: keyId,
      amount: order.amount,
      currency: order.currency,
      name: params.businessName ?? "BizTradeFairs",
      description: `${params.planName} — ${params.role} plan`,
      order_id: order.order_id,
      prefill: params.prefill,
      theme: { color: "#004A96" },
      handler: (response) => {
        void (async () => {
          try {
            const verified = await verifyPayment(response);
            await activatePaidSubscription(verified.paymentTransactionId);
            resolve(verified);
          } catch (error) {
            reject(error instanceof Error ? error : new Error("Payment failed"));
          }
        })();
      },
      modal: {
        ondismiss: () => {
          params.onDismiss?.();
          reject(new Error("Payment cancelled"));
        },
      },
    });

    rzp.on("payment.failed", (response) => {
      reject(new Error(response.error?.description ?? "Payment failed"));
    });

    rzp.open();
  });
}

export { inrToPaise };
