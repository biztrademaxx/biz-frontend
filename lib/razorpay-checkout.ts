"use client";

import { getAccessToken } from "@/lib/api";

export type RazorpayPaymentResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

export type PromotionPaymentChannel = "EVENT" | "ORGANIZER" | "EXHIBITOR";

export type PromotionPaymentContext = {
  promotionChannel: PromotionPaymentChannel;
  eventId?: string;
  organizerId?: string;
  exhibitorId?: string;
  packageType: string;
  targetCategories: string[];
  durationDays: number;
  amountInr: number;
};

type RazorpayHandlerResponse = RazorpayPaymentResponse;

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  order_id: string;
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color?: string };
  handler: (response: RazorpayHandlerResponse) => void;
  modal?: {
    ondismiss?: () => void;
  };
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => {
      open: () => void;
      on: (event: string, callback: (response: { error?: { description?: string } }) => void) => void;
    };
  }
}

function authHeaders(): HeadersInit {
  const token = getAccessToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

export function loadRazorpayScript(): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (window.Razorpay) return Promise.resolve(true);

  return new Promise((resolve) => {
    const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(!!window.Razorpay));
      existing.addEventListener("error", () => resolve(false));
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(!!window.Razorpay);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

async function createOrder(
  amountPaise: number,
  receipt: string,
  paymentContext: PromotionPaymentContext,
): Promise<{
  order_id: string;
  amount: number;
  currency: string;
  payment_transaction_id: string;
}> {
  const response = await fetch("/api/create-order", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      amount: amountPaise,
      currency: "INR",
      receipt,
      ...paymentContext,
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message ?? "Failed to create payment order");
  }
  return data;
}

export type VerifiedPromotionPayment = {
  paymentTransactionId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
};

async function verifyPayment(payment: RazorpayPaymentResponse): Promise<VerifiedPromotionPayment> {
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
    paymentTransactionId: data.payment_transaction_id,
    razorpayOrderId: data.razorpay_order_id,
    razorpayPaymentId: data.razorpay_payment_id,
  };
}

/** Wait for Radix/shadcn dialog overlays to unmount before opening Razorpay. */
export function waitForCheckoutOverlayCleanup(ms = 400): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(() => {
      document.body.style.pointerEvents = "";
      document.body.removeAttribute("data-scroll-locked");
      resolve();
    }, ms);
  });
}

/** Convert INR rupees to paise (minimum 100 paise). */
export function inrToPaise(amountInr: number): number {
  return Math.max(100, Math.round(amountInr * 100));
}

export type OpenRazorpayCheckoutParams = {
  amountInr: number;
  receipt: string;
  description: string;
  paymentContext: PromotionPaymentContext;
  businessName?: string;
  prefill?: { name?: string; email?: string; contact?: string };
  onDismiss?: () => void;
  delayBeforeOpenMs?: number;
};

/**
 * Create order on Express backend, open Razorpay modal, verify signature on success.
 */
export async function openRazorpayCheckout(
  params: OpenRazorpayCheckoutParams,
): Promise<VerifiedPromotionPayment> {
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

  const amountPaise = inrToPaise(params.amountInr);
  const order = await createOrder(amountPaise, params.receipt, params.paymentContext);

  return new Promise((resolve, reject) => {
    const rzp = new window.Razorpay!({
      key: keyId,
      amount: order.amount,
      currency: order.currency,
      name: params.businessName ?? "BizTradeFairs",
      description: params.description,
      order_id: order.order_id,
      prefill: params.prefill,
      theme: { color: "#004A96" },
      handler: (response) => {
        void (async () => {
          try {
            const verified = await verifyPayment(response);
            resolve(verified);
          } catch (error) {
            reject(error instanceof Error ? error : new Error("Payment verification failed"));
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
      const message = response.error?.description ?? "Payment failed";
      reject(new Error(message));
    });

    rzp.open();
  });
}
