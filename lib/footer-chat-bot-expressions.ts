/**
 * Footer chat: expression engine (typing → emoji + label) and rule-based replies.
 * Swap {@link resolveBotReply} implementation later for a real API without changing UI components.
 */

export type BotExpressionId =
  | "idle"
  | "wave"
  | "happy"
  | "thinking"
  | "curious"
  | "excited"
  | "support"
  | "grateful"
  | "gentle"
  | "typing"
  | "listening"

export type BotExpression = {
  id: BotExpressionId
  emoji: string
  label: string
}

/** Keyword / regex row for the expression avatar while the user types. */
export type ExpressionRule = {
  id: BotExpressionId
  emoji: string
  label: string
  /** Higher runs first; first match wins. */
  priority: number
  /** Matched as whole words (case-insensitive) unless length ≤ 1 (substring). */
  keywords?: string[]
  /** Optional regex checks (e.g. `\?`, multi-word phrases). */
  patterns?: RegExp[]
}

/** Same shape for canned bot replies after send. */
export type ReplyRule = {
  /** Higher runs first; first match wins. More specific intents must outrank generic ones. */
  priority: number
  /** Plain text; use **word** for bold segments in the UI. */
  message: string
  keywords?: string[]
  patterns?: RegExp[]
}

export const DEFAULT_EXPRESSION: BotExpression = {
  id: "idle",
  emoji: "🤖",
  label: "Here to help",
}

const GENTLE_EXPRESSION: BotExpression = { id: "gentle", emoji: "✍️", label: "Take your time" }
const TYPING_EXPRESSION: BotExpression = { id: "typing", emoji: "💬", label: "Listening…" }
const LISTENING_EXPRESSION: BotExpression = { id: "listening", emoji: "👀", label: "Listening…" }

/**
 * Ordered by priority (descending). First matching rule drives the avatar.
 * Add rows here to extend behavior — no branching chain to maintain.
 */
export const EXPRESSION_RULES: ExpressionRule[] = [
  {
    id: "wave",
    emoji: "👋",
    label: "Hello there!",
    priority: 100,
    keywords: ["hi", "hey", "hello", "hii", "yo", "gm"],
    patterns: [/^good morning\b/i, /^good evening\b/i, /\b(hi|hey|hello)\b/i],
  },
  {
    id: "grateful",
    emoji: "🙏",
    label: "Happy to help!",
    priority: 95,
    keywords: ["thanks", "thx", "ty", "appreciate"],
    patterns: [/\bthank you\b/i, /\bthank\b/i],
  },
  {
    id: "thinking",
    emoji: "🤔",
    label: "Let me think…",
    priority: 90,
    keywords: ["help", "support", "where", "when", "why"],
    patterns: [/\?/, /\bhow do\b/i, /\bhow can\b/i, /\bwhat is\b/i],
  },
  {
    id: "excited",
    emoji: "✨",
    label: "Events & more!",
    priority: 85,
    keywords: ["event", "events", "fair", "expo", "trade", "venue", "book", "ticket", "register"],
    patterns: [/\bevents?\b/i],
  },
  {
    id: "curious",
    emoji: "🧐",
    label: "About pricing",
    priority: 82,
    keywords: ["price", "cost", "fee", "pay", "billing", "refund"],
  },
  {
    id: "support",
    emoji: "💙",
    label: "I’m on it",
    priority: 80,
    keywords: ["sorry", "issue", "problem", "error", "broken"],
    patterns: [/\bnot working\b/i],
  },
  {
    id: "happy",
    emoji: "😊",
    label: "So glad!",
    priority: 75,
    keywords: ["love", "great", "awesome", "amazing", "perfect"],
  },
]

/**
 * Reply intents: **order by priority only** — higher = evaluated first.
 * Use **patterns** for phrases; use **keywords** for single tokens (plural forms listed explicitly).
 */
export const REPLY_RULES: ReplyRule[] = [
  {
    priority: 100,
    message:
      "**BizTradeFairs** is a marketplace to discover trade shows, conferences, and expos; connect with **organizers**, **venues**, **exhibitors**, and **speakers**; and manage listings from your dashboard when you sign up as an organizer or venue.",
    patterns: [
      /\bwhat is\b.*\b(biztrade|biztradefairs)\b/i,
      /\bwho are you\b/i,
      /\bwhat('s| is) (this|the) (site|platform|website)\b/i,
      /\b(tell me )?about (biztrade|biztradefairs|this site)\b/i,
    ],
  },
  {
    priority: 99,
    message:
      "To **list or add an event**, sign up or log in as an **Organizer**, then use your **organizer dashboard** to create and publish events. You can start from **Become Organizer** in the footer or open **Organizer** signup — then follow the create-event flow there.",
    patterns: [
      /\bhow (do|to|can) (i|you|we) (add|create|post|list|publish|submit)\b.*\bevents?\b/i,
      /\b(add|create|post|list|publish|submit) (an? )?events?\b/i,
      /\bhow (do|to) (add|create|post)\b/i,
    ],
  },
  {
    priority: 98,
    message:
      "To **find or join events**, open **Find Events** from the menu or home, filter by category or location, then open an event to register or save it. You’ll need a visitor account for some actions — use **Sign up** if you’re new.",
    patterns: [
      /\bhow (do|to|can) (i|you) (find|search|browse|register|book|attend|join)\b.*\bevents?\b/i,
      /\b(find|search|browse) (for )?events?\b/i,
      /\bregister (for|to) (an? )?event\b/i,
    ],
  },
  {
    priority: 97,
    message:
      "Hi! I’m your BizTradeFairs assistant. Ask me about **events**, **venues**, **organizers**, or account help.",
    patterns: [/^(hi|hello|hey|hii)[!.,\s]*$/i, /^(good morning|good evening)\b/i],
    keywords: ["hi", "hello", "hey"],
  },
  {
    priority: 96,
    message: "You’re welcome! If you need anything else, just type away.",
    patterns: [/\b(thanks|thank you|thx|ty)\b/i],
  },
  {
    priority: 93,
    message:
      "You can browse events from the home page or use **Find Events** in the menu. Filters help narrow by category and location.",
    keywords: ["events", "event", "fair", "expo", "trade show"],
  },
  {
    priority: 92,
    message:
      "Venue listings are under **Book Venues**. You can explore spaces and contact hosts from each profile.",
    keywords: ["venue", "venues", "book a venue", "book venue"],
  },
  {
    priority: 91,
    message:
      "We connect **organizers**, **exhibitors**, and **speakers**. Check **Services** in the footer for the right entry point.",
    keywords: ["organizer", "organizers", "exhibitor", "exhibitors", "speaker", "speakers"],
  },
  {
    priority: 90,
    message:
      "Pricing depends on the organizer or venue. Open an event or venue page for specifics, or use **Contact Us** for billing questions.",
    keywords: ["price", "cost", "fee", "pay", "billing", "refund"],
  },
  {
    priority: 88,
    message:
      "For account or technical issues, visit **Support Center** or **Contact Us** — our team can pick up from there.",
    keywords: ["help", "support", "problem", "issue"],
    patterns: [/\bnot working\b/i],
  },
  {
    priority: 60,
    message:
      "Good question! For step-by-step answers, open **FAQ** or **Contact Us** in the footer. You can also ask about **events**, **venues**, **signing up**, or **listing an event** — I’ll match more specific phrases.",
    patterns: [/\b(what|how|why|when|where|who)\b.*\?$/i, /\?/],
  },
]

const FALLBACK_REPLY =
  "I’m not sure I understood that one. Try asking about **events**, **venues**, **BizTradeFairs**, or **how to list an event** — or visit **FAQ** and **Contact Us** in the footer."

function escapeRegexKeyword(keyword: string): string {
  return keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

/**
 * Normalize for matching: trim, lowercase, collapse internal whitespace.
 * Export for tests and any future API layer.
 */
export function normalizeUserMessage(message: string): string {
  return message
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
}

function matchesKeyword(t: string, keyword: string): boolean {
  const k = keyword.trim().toLowerCase()
  if (!k) return false
  if (k.length <= 1) return t.includes(k)
  if (k.includes(" ")) return t.includes(k)
  return new RegExp(`\\b${escapeRegexKeyword(k)}\\b`, "i").test(t)
}

export function ruleMatchesText(t: string, rule: Pick<ExpressionRule | ReplyRule, "keywords" | "patterns">): boolean {
  if (rule.patterns?.some((p) => p.test(t))) return true
  if (rule.keywords?.some((kw) => matchesKeyword(t, kw))) return true
  return false
}

function expressionFromRule(rule: ExpressionRule): BotExpression {
  return { id: rule.id, emoji: rule.emoji, label: rule.label }
}

/**
 * Live avatar mood while the user types (draft). Pure function — safe for debouncing in UI.
 */
export function expressionFromInput(draft: string): BotExpression {
  const t = normalizeUserMessage(draft)
  if (t.length === 0) return DEFAULT_EXPRESSION

  const ordered = [...EXPRESSION_RULES].sort((a, b) => b.priority - a.priority)
  for (const rule of ordered) {
    if (ruleMatchesText(t, rule)) return expressionFromRule(rule)
  }

  if (t.length >= 40) return GENTLE_EXPRESSION
  if (t.length >= 8) return TYPING_EXPRESSION
  return LISTENING_EXPRESSION
}

/** Synchronous canned reply from local rules (same priority semantics). */
export function botReplyFor(userMessage: string): string {
  const t = normalizeUserMessage(userMessage)
  if (!t) return "Type something and I’ll respond!"

  const ordered = [...REPLY_RULES].sort((a, b) => b.priority - a.priority)
  for (const rule of ordered) {
    if (ruleMatchesText(t, rule)) return rule.message
  }

  return FALLBACK_REPLY
}

/**
 * Single async seam for the UI: today delegates to {@link botReplyFor}.
 * Replace the body with `fetch('/api/chat', …)` when wiring a real model.
 */
export async function resolveBotReply(userMessage: string): Promise<string> {
  return botReplyFor(userMessage)
}

/** Typing delay bounds (ms) — used by the widget for perceived latency. */
export function suggestedReplyDelayMs(userMessageLength: number): number {
  return 600 + Math.min(400, userMessageLength * 8)
}
