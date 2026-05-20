"use client";

import { FormEvent, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, Mail, Send } from "lucide-react";

type NewsletterFooterSignupProps = {
  className?: string;
};

export function NewsletterFooterSignup({ className }: NewsletterFooterSignupProps) {
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
        "overflow-hidden rounded-2xl border border-sky-200/80 bg-gradient-to-br from-sky-50 via-blue-50/90 to-sky-100/70 px-5 py-8 shadow-sm sm:px-8 sm:py-10",
        className,
      )}
      aria-labelledby="footer-newsletter-heading"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-8 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
        {/* Left: icon + copy */}
        <div className="flex min-w-0 flex-1 gap-4 sm:gap-5">
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/90 text-[#002C71] shadow-md ring-1 ring-sky-200/60 sm:h-16 sm:w-16"
            aria-hidden
          >
            <Mail className="h-7 w-7 sm:h-8 sm:w-8" strokeWidth={1.75} />
          </div>
          <div className="min-w-0 pt-0.5">
            <h2
              id="footer-newsletter-heading"
              className="text-xl font-bold tracking-tight text-[#002C71] sm:text-2xl"
            >
              Stay Updated with BizTradeFairs
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-[15px]">
              Subscribe to our newsletter for the latest events, industry insights &amp; exclusive updates.
            </p>
          </div>
        </div>

        {/* Right: form */}
        <div className="w-full shrink-0 lg:max-w-md xl:max-w-lg">
          <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-stretch sm:gap-3">
            <div className="relative min-w-0 flex-1">
              <Mail
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
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
                className="h-11 w-full border-slate-200 bg-white pl-10 pr-3 text-sm shadow-sm placeholder:text-slate-400 focus-visible:border-[#002C71] focus-visible:ring-2 focus-visible:ring-[#002C71]/20"
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
          <p className="mt-3 flex items-start gap-2 text-xs leading-snug text-slate-500 sm:text-sm">
            <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
            <span>We respect your privacy. Unsubscribe anytime.</span>
          </p>
          {message ? (
            <p
              className={`mt-2 text-sm font-medium ${status === "ok" ? "text-emerald-700" : "text-red-600"}`}
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
