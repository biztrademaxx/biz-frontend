"use client"

import { useState } from "react"
import { ThumbsDown, ThumbsUp } from "lucide-react"
import { AnimatedBizzBot } from "@/components/AnimatedBizzBot"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/**
 * Guest welcome card styled like the reference: numbered steps, sub-bullets,
 * feedback chips, bot row with Bizz avatar.
 */
export function FooterChatGettingStartedMessage() {
  const [feedback, setFeedback] = useState<"helpful" | "more" | null>(null)

  return (
    <div className="rounded-2xl rounded-bl-md border border-gray-200 bg-white px-3.5 py-3.5 shadow-sm sm:px-4 sm:py-4">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-gradient-to-br from-slate-50 to-slate-100 shadow-inner">
          <AnimatedBizzBot size={26} calm className="scale-90" />
        </div>
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Bizz</span>
      </div>

      <p className="mb-3 text-sm font-medium leading-snug text-slate-800">
        To get started on <span className="text-[#002c71]">BizTradeFairs</span>:
      </p>

      <ol className="list-none space-y-3.5 pl-0 text-sm leading-relaxed text-slate-800">
        <li className="flex gap-2.5">
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#002c71] text-xs font-bold text-white">
            1
          </span>
          <span>Click <strong className="font-semibold text-[#002c71]">Sign Up</strong> at the top right of the page</span>
        </li>
        <li className="flex gap-2.5">
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#002c71] text-xs font-bold text-white">
            2
          </span>
          <div className="min-w-0 space-y-2">
            <span>Choose your account type:</span>
            <ul className="space-y-1.5 border-l-2 border-teal-600/30 pl-3 text-[13px] leading-snug text-slate-700">
              <li>
                <span className="font-semibold text-[#002c71]">Organizer</span> — create and manage trade events
              </li>
              <li>
                <span className="font-semibold text-[#002c71]">Exhibitor / Supplier</span> — showcase your products
              </li>
              <li>
                <span className="font-semibold text-[#002c71]">Visitor</span> — discover events and connect with exhibitors
              </li>
            </ul>
          </div>
        </li>
        <li className="flex gap-2.5">
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#002c71] text-xs font-bold text-white">
            3
          </span>
          <span>Verify your email address</span>
        </li>
        <li className="flex gap-2.5">
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#002c71] text-xs font-bold text-white">
            4
          </span>
          <span>Complete your profile to unlock all features</span>
        </li>
      </ol>

      <p className="mt-4 text-sm text-slate-700">Need help with a specific step?</p>

      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={cn(
            "h-9 rounded-full border-emerald-500/70 bg-white px-3 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800",
            feedback === "helpful" && "border-emerald-600 bg-emerald-50",
          )}
          onClick={() => setFeedback("helpful")}
        >
          <ThumbsUp className="mr-1.5 h-4 w-4" aria-hidden />
          Helpful
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={cn(
            "h-9 rounded-full border-rose-400/80 bg-white px-3 text-rose-600 hover:bg-rose-50 hover:text-rose-700",
            feedback === "more" && "border-rose-500 bg-rose-50",
          )}
          onClick={() => setFeedback("more")}
        >
          <ThumbsDown className="mr-1.5 h-4 w-4" aria-hidden />
          Need more help
        </Button>
      </div>

      {feedback === "helpful" && (
        <p className="mt-2 text-xs text-emerald-700">Thanks — tell us below if you need anything else.</p>
      )}
      {feedback === "more" && (
        <p className="mt-2 text-xs text-rose-700">No problem — describe your step below and we’ll guide you.</p>
      )}
    </div>
  )
}
