"use client";

import { FormEvent, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, Mail, Send } from "lucide-react";

type NewsletterFooterSignupProps = {
  className?: string;
  variant?: "default" | "on-dark";
};

export function NewsletterFooterSignup({
  className,
  variant = "default",
}: NewsletterFooterSignupProps) {
  const onDark = variant === "on-dark";
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "err">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage(null);
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await res.json().catch(() => ({}))) as { success?: boolean; error?: string; message?: string };
      if (!res.ok || !data.success) {
        setStatus("err");
        setMessage(typeof data.error === "string" ? data.error : "Could not subscribe.");
        return;
      }
      setStatus("ok");
      setMessage(typeof data.message === "string" ? data.message : "Thanks — you’re subscribed.");
      setEmail("");
    } catch {
      setStatus("err");
      setMessage("Network error. Please try again.");
    }
  }

  return (
    <section
      className={cn(
        "overflow-hidden rounded-2xl px-5 py-8 sm:px-8 sm:py-10",
        onDark
          ? "border border-white/20 bg-white/10 shadow-sm backdrop-blur-sm"
          : "border border-sky-200/80 bg-gradient-to-br from-sky-50 via-blue-50/90 to-sky-100/70 shadow-sm",
        className,
      )}
      aria-labelledby="footer-newsletter-heading"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-8 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
        <div className="flex min-w-0 flex-1 gap-4 sm:gap-5">
          <div
            className={cn(
              "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-md sm:h-16 sm:w-16",
              onDark
                ? "bg-white/15 text-white ring-1 ring-white/25"
                : "bg-white/90 text-[#002C71] ring-1 ring-sky-200/60",
            )}
            aria-hidden
          >
            <Mail className="h-7 w-7 sm:h-8 sm:w-8" strokeWidth={1.75} />
          </div>
          <div className="min-w-0 pt-0.5">
            <h2
              id="footer-newsletter-heading"
              className={cn(
                "text-xl font-bold tracking-tight sm:text-2xl",
                onDark ? "text-white" : "text-[#002C71]",
              )}
            >
              Stay Updated with BizTradeFairs
            </h2>
            <p
              className={cn(
                "mt-2 max-w-xl text-sm leading-relaxed sm:text-[15px]",
                onDark ? "text-white/85" : "text-slate-600",
              )}
            >
              Subscribe to our newsletter for the latest events, industry insights &amp; exclusive updates.
            </p>
          </div>
        </div>

        <div className="w-full shrink-0 lg:max-w-md xl:max-w-lg">
          <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-stretch sm:gap-3">
            <div className="relative min-w-0 flex-1">
              <Mail
                className={cn(
                  "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2",
                  onDark ? "text-white/50" : "text-slate-400",
                )}
                aria-hidden
              />
              <Input
                type="email"
                name="email"
                required
                autoComplete="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={status === "loading"}
                className={cn(
                  "h-11 w-full pl-10 pr-3 text-sm shadow-sm",
                  onDark
                    ? "border-white/25 bg-white/10 text-white placeholder:text-white/50 focus-visible:border-white/40 focus-visible:ring-2 focus-visible:ring-white/20"
                    : "border-slate-200 bg-white placeholder:text-slate-400 focus-visible:border-[#002C71] focus-visible:ring-2 focus-visible:ring-[#002C71]/20",
                )}
              />
            </div>
            <Button
              type="submit"
              disabled={status === "loading"}
              className="h-11 shrink-0 gap-2 rounded-lg bg-[#002C71] px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#001a48] disabled:opacity-60 sm:min-w-[140px]"
            >
              <Send className="h-4 w-4" aria-hidden />
              {status === "loading" ? "…" : "Subscribe"}
            </Button>
          </form>
          <p
            className={cn(
              "mt-3 flex items-start gap-2 text-xs leading-snug sm:text-sm",
              onDark ? "text-white/75" : "text-slate-500",
            )}
          >
            <Lock
              className={cn("mt-0.5 h-3.5 w-3.5 shrink-0", onDark ? "text-white/60" : "text-slate-400")}
              aria-hidden
            />
            <span>We respect your privacy. Unsubscribe anytime.</span>
          </p>
          {message ? (
            <p
              className={cn(
                "mt-2 text-sm font-medium",
                status === "ok"
                  ? onDark
                    ? "text-emerald-300"
                    : "text-emerald-700"
                  : onDark
                    ? "text-red-300"
                    : "text-red-600",
              )}
              role="status"
            >
              {message}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
