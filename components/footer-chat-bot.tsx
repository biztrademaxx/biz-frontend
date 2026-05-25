"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { AnimatePresence, motion } from "framer-motion"
import { Send, X } from "lucide-react"
import { AnimatedBizzBot } from "@/components/AnimatedBizzBot"
import { FooterChatGettingStartedMessage } from "@/components/footer-chat-onboarding-message"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DEFAULT_EXPRESSION,
  expressionFromInput,
  resolveBotReply,
  suggestedReplyDelayMs,
  type BotExpression,
} from "@/lib/footer-chat-bot-expressions"
import { getAccessToken, getCurrentUserRole } from "@/lib/api"
import { isFooterChatAdminRole } from "@/lib/footer-chat-onboarding"

const LOGGED_IN_WELCOME =
  "Hi! I’m **Bizz**, your BizTradeFairs assistant. Ask me about events, venues, or your dashboard — watch my expression change as you type!"

const ADMIN_WELCOME =
  "Hi! I’m **Bizz**. Ask me about the platform, events, or support links — I’ll keep answers concise for admin use."

function getFooterChatInitialMessages(): ChatMessage[] {
  if (typeof window === "undefined") {
    return [{ id: "welcome", role: "bot", kind: "getting-started" }]
  }
  if (!getAccessToken()) {
    return [{ id: "welcome", role: "bot", kind: "getting-started" }]
  }
  const role = getCurrentUserRole()
  if (isFooterChatAdminRole(role)) {
    return [{ id: "welcome", role: "bot", kind: "text", text: ADMIN_WELCOME }]
  }
  return [{ id: "welcome", role: "bot", kind: "text", text: LOGGED_IN_WELCOME }]
}

type ChatMessage =
  | { id: string; role: "user"; text: string }
  | { id: string; role: "bot"; kind: "text"; text: string }
  | { id: string; role: "bot"; kind: "getting-started" }

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function FormattedMessageText({ text }: { text: string }) {
  return (
    <>
      {text.split("**").map((part, i) =>
        i % 2 === 1 ? (
          <strong key={i} className="font-semibold">
            {part}
          </strong>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  )
}

export default function FooterChatBot() {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [draft, setDraft] = useState("")
  const [expression, setExpression] = useState<BotExpression>(DEFAULT_EXPRESSION)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [botTyping, setBotTyping] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)
  const [isOnLightSection, setIsOnLightSection] = useState(false)


  useEffect(() => {
    const handleScroll = () => {
      const footer = document.querySelector("footer")

      if (!footer) return

      const rect = footer.getBoundingClientRect()

      // if footer visible => dark mode
      // otherwise => light mode
      setIsOnLightSection(rect.top > window.innerHeight - 120)
    }

    handleScroll()

    window.addEventListener("scroll", handleScroll, { passive: true })

    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    setMessages(getFooterChatInitialMessages())
    setMounted(true)
  }, [])

  useEffect(() => {
    setExpression(expressionFromInput(draft))
  }, [draft])

  useEffect(() => {
    if (!listRef.current) return
    listRef.current.scrollTop = listRef.current.scrollHeight
  }, [messages, open, botTyping])

  const send = useCallback(async () => {
    const text = draft.trim()
    if (!text) return

    const userMsg: ChatMessage = { id: uid(), role: "user", text }
    setMessages((m) => [...m, userMsg])
    setDraft("")
    setBotTyping(true)

    const delay = suggestedReplyDelayMs(text.length)
    try {
      const reply = await resolveBotReply(text)
      window.setTimeout(() => {
        setBotTyping(false)
        setMessages((m) => [...m, { id: uid(), role: "bot", kind: "text", text: reply }])
      }, delay)
    } catch {
      setBotTyping(false)
      setMessages((m) => [
        ...m,
        {
          id: uid(),
          role: "bot",
          kind: "text",
          text: "Something went wrong. Please try **Contact Us** in the footer.",
        },
      ])
    }
  }, [draft])

  const panel = (
    <AnimatePresence>
      {open && (
        <motion.div
          key="chat-panel"
          initial={{ opacity: 0, y: 24, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.96 }}
          transition={{ type: "spring", stiffness: 380, damping: 28 }}
          className="fixed bottom-4 right-4 z-[250] flex w-[min(100vw-1.5rem,22rem)] flex-col overflow-hidden rounded-2xl border border-[#002c71]/20 bg-white shadow-[0_20px_50px_-12px_rgba(0,44,113,0.38)] ring-1 ring-teal-600/10"
          role="dialog"
          aria-label="Chat with Bizz — BizTradeFairs assistant"
        >
          {/* Header */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#002c71] via-[#003d99] to-teal-600 px-4 py-3 text-white shadow-[inset_0_-1px_0_rgba(255,255,255,0.12)]">
            <motion.div
              className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10 blur-2xl"
              animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.65, 0.4] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
            <div className="relative flex items-center gap-3">
              <motion.div
                key={expression.id + expression.emoji}
                initial={{ scale: 0.5, rotate: -12 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 18 }}
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-3xl shadow-inner ring-2 ring-white/20 backdrop-blur-sm"
                aria-hidden
              >
                {/* {expression.emoji} */}
                <AnimatedBizzBot size={80}/>
              </motion.div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold leading-tight">Chat With Bizz</p>
                <motion.p
                  key={expression.label}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="truncate text-xs text-white/90"
                >
                  {expression.label}
                </motion.p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="shrink-0 text-white hover:bg-white/10"
                onClick={() => setOpen(false)}
                aria-label="Close chat"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <div
            ref={listRef}
            className="max-h-[min(52vh,320px)] space-y-3 overflow-y-auto bg-gradient-to-b from-slate-50/95 to-slate-100/90 px-3 py-3"
          >
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, x: msg.role === "user" ? 12 : -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ type: "spring", stiffness: 350, damping: 28 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={
                    msg.role === "user"
                      ? "max-w-[92%] rounded-2xl rounded-br-md bg-[#002c71] px-3 py-2 text-sm leading-relaxed text-white shadow-md shadow-[#002c71]/25"
                      : msg.kind === "getting-started"
                        ? "w-full max-w-[98%]"
                        : "max-w-[92%] rounded-2xl rounded-bl-md border border-[#002c71]/12 bg-gradient-to-br from-white via-white to-teal-50/35 px-3 py-2 text-sm leading-relaxed text-gray-800 shadow-sm"
                  }
                >
                  {msg.role === "user" ? (
                    <FormattedMessageText text={msg.text} />
                  ) : msg.kind === "getting-started" ? (
                    <FooterChatGettingStartedMessage />
                  ) : (
                    <FormattedMessageText text={msg.text} />
                  )}
                </div>
              </motion.div>
            ))}
            {botTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="flex items-center gap-1 rounded-2xl rounded-bl-md border border-[#002c71]/10 bg-white px-3 py-2 shadow-sm">
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="h-2 w-2 rounded-full bg-gradient-to-br from-[#002c71] to-teal-600 opacity-70"
                      animate={{ y: [0, -5, 0], opacity: [0.5, 1, 0.5] }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        delay: i * 0.12,
                        ease: "easeInOut",
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-[#002c71]/10 bg-white p-3">
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault()
                void send()
              }}
            >
              <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Type a follow-up question…"
                className="flex-1 rounded-full border-[#002c71]/15 py-5 text-sm focus-visible:ring-violet-500/30"
                aria-label="Message"
                maxLength={2000}
              />
              <Button
                type="submit"
                size="icon"
                className="h-11 w-11 shrink-0 rounded-full bg-[#5b21b6] text-white shadow-md hover:bg-[#4c1d95]"
                disabled={!draft.trim() || botTyping}
                aria-label="Send"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )

const launcher = (
  <AnimatePresence>
    {!open && (
      <motion.div
        key="chat-launcher"
        initial={{ opacity: 0, y: 16, scale: 0.92 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.96 }}
        transition={{ type: "spring", stiffness: 380, damping: 28 }}
        className="pointer-events-none fixed bottom-2 right-2 z-[260] flex justify-end sm:bottom-4 sm:right-4"
      >
        <motion.button
          type="button"
          onClick={() => setOpen(true)}
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="pointer-events-auto border-0 bg-transparent p-0 shadow-none"
          aria-expanded={false}
          aria-haspopup="dialog"
          aria-label="Open Chat With Bizz"
        >
          <div className="flex items-center">

            {/* BOT */}
            <div className="relative shrink-0">
              <AnimatedBizzBot
                size={180}
                className="drop-shadow-[0_10px_25px_rgba(0,0,0,0.18)]"
              />
            </div>

            {/* TEXT */}
            <div className="-ml-[42px] mb-1">

              <div className="relative px-1 py-1">

                {/* BUTTON */}
                <div className="rounded-full bg-green-700 px-3 py-[6px] shadow-[0_10px_25px_rgba(0,176,80,0.35)]">
                  <span className="whitespace-nowrap text-[10px] font-extrabold leading-none tracking-[-0.01em] text-white sm:text-[16px]">
                    Chat With Biz!
                  </span>
                </div>

                {/* SUBTEXT */}
                <p
                  className={`pt-2 text-center text-[8px] font-medium leading-none sm:text-[11px] ${isOnLightSection ? "text-[#1F1F1F]" : "text-white"
                    }`}
                >
                  Ask me about events
                </p>
              </div>
            </div>
          </div>
        </motion.button>
      </motion.div>
    )}
  </AnimatePresence>
)
  return (
    <>
      {mounted && createPortal(
        <>
          {launcher}
          {panel}
        </>,
        document.body,
      )}
    </>
  )
}
