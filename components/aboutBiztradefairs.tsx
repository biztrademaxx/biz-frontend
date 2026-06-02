import {
    CalendarDays,
    Globe,
    Users,
    Building2,
    Handshake,
    ArrowRight,
    ShieldCheck,
    TrendingUp,
    HeadphonesIcon,
    Sparkles,
    Clock3,
} from "lucide-react"
import Link from "next/link"

const stats = [
    { value: "12K+", label: "Events", sub: "Across all industries" },
    { value: "180+", label: "Countries", sub: "Global coverage" },
    { value: "4.2M+", label: "Visitors", sub: "Every year" },
]

// Define types for the card structure
interface Card {
    icon?: any;
    title: string;
    sub?: string;
    avatars?: string[] | null;
    bg?: string;
    iconColor?: string;
    avatarLetters?: string[];
}

const topCards: Card[] = [
    {
        icon: Globe,
        title: "Global Network",
        avatars: null,
        bg: "bg-blue-100",
        iconColor: "text-blue-600",
    },
    {
        icon: null,
        title: "320K",
        sub: "Users worldwide",
        avatars: ["bg-red-200 text-red-800", "bg-green-200 text-green-800", "bg-violet-200 text-violet-800"],
        avatarLetters: ["A", "B", "C"],
    },
    {
        icon: CalendarDays,
        title: "15ms",
        sub: "Avg. response",
        bg: "bg-slate-100",
        iconColor: "text-slate-500",
    },
]

const bottomCards: Card[] = [
    {
        icon: Building2,
        title: "Verified Exhibitors",
        bg: "bg-blue-100",
        iconColor: "text-blue-600",
    },
    {
        icon: null,
        title: "99%",
        sub: "Sound clarity",
        avatars: ["bg-yellow-200 text-yellow-800", "bg-blue-200 text-blue-800", "bg-pink-200 text-pink-800"],
        avatarLetters: ["D", "E", "F"],
    },
    {
        icon: Handshake,
        title: "Quality Events",
        bg: "bg-slate-100",
        iconColor: "text-slate-500",
    },
]

// Add proper type for the props
interface StatRowProps {
    cards: Card[];
}

function StatRow({ cards }: StatRowProps) {
    return (
        <div className="grid grid-cols-3 gap-5">
            {cards.map((card, i) => (
                <div
                    key={i}
                    className="rounded-3xl border border-slate-200 bg-white p-6 min-h-[140px] flex items-center"
                >
                    {card.avatars ? (
                        <div>
                            <div className="flex mb-4">
                                {card.avatars.map((cls, j) => (
                                    <div
                                        key={j}
                                        className={`h-10 w-10 rounded-full border-2 border-white flex items-center justify-center text-sm font-semibold ${cls} ${j > 0 ? "-ml-3" : ""
                                            }`}
                                    >
                                        {card.avatarLetters?.[j]}
                                    </div>
                                ))}
                            </div>

                            <h3 className="text-[42px] font-semibold leading-none text-slate-900">
                                {card.title}
                            </h3>

                            {card.sub && (
                                <p className="mt-2 text-[15px] text-slate-500">
                                    {card.sub}
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center gap-5">
                            <div
                                className={`flex h-16 w-16 items-center justify-center rounded-full ${card.bg}`}
                            >
                                {card.icon && (
                                    <card.icon
                                        size={28}
                                        className={card.iconColor}
                                    />
                                )}
                            </div>

                            <div>
                                <h3 className="text-[28px] font-semibold text-slate-900">
                                    {card.title}
                                </h3>

                                {card.sub && (
                                    <p className="mt-1 text-[15px] text-slate-500">
                                        {card.sub}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

export default function AboutBizTrade() {
    return (
        <section className="bg-[#f8f9fc] py-16">
            <div className="mx-auto w-full min-w-0 max-w-7xl px-3 sm:px-4 lg:px-6">
                <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] gap-16 items-center">
                    {/* ── LEFT ── */}
                    <div>
                        {/* Label */}
                        <div className="mb-8 flex items-center gap-3">
                            <Sparkles size={14} className="text-[#111]" />
                            <span className="text-[13px] font-medium uppercase tracking-[0.35em] text-[#111]">
                                ABOUT BIZTRADE FAIRS
                            </span>
                        </div>

                        {/* Heading */}
                        <h2 className="max-w-[720px] text-[52px] md:text-[64px] lg:text-[78px] font-[300] leading-[0.95] tracking-[-0.05em] text-[#0A0A0A]">
                            Connecting{" "}
                            <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#4AA8FF] align-middle">
                                <Globe size={28} className="text-white" />
                            </span>{" "}
                            Buyers,
                            <br />
                            Exhibitors & Industry
                            <br />
                            <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#4AA8FF] align-middle">
                                <Users size={28} className="text-white" />
                            </span>{" "}
                            Leaders Worldwide
                        </h2>

                        {/* Accent line */}
                        <div className="mt-6 h-[4px] w-12 rounded-full bg-[#2563EB]" />

                        {/* Description */}
                        <p className="mt-8 max-w-[520px] text-[18px] leading-[1.8] text-[#7B8794]">
                            BizTrade Fairs is the world's most comprehensive platform for
                            discovering trade shows, exhibitions and business events. We connect
                            businesses with the right opportunities to grow, network and expand
                            globally.
                        </p>

                        {/* Buttons */}
                        <div className="mt-10 flex flex-wrap gap-4">
                            <Link
                                href="/event"
                                className="inline-flex items-center gap-3 rounded-full bg-[#18337C] px-8 py-4 text-[16px] font-medium text-white transition-all hover:bg-[#10245A]"
                            >
                                Explore Events
                                <ArrowRight size={18} />
                            </Link>

                            <Link
                                href="/about"
                                className="inline-flex items-center rounded-full border border-[#D6DCE5] bg-white px-8 py-4 text-[16px] font-medium text-[#0A0A0A] transition-all hover:border-[#B8C2CF]"
                            >
                                Learn more
                            </Link>
                        </div>
                    </div>

                    {/* ── RIGHT ── */}
                    {/* ── RIGHT ── */}
                    <div className="flex flex-col justify-center gap-16">

                        {/* Row 1 */}
                        <div className="grid grid-cols-3 gap-10">

                            {/* Stat 1 */}
                            <div>
                                <div className="mb-5 flex">
                                    <div className="h-10 w-10 rounded-full bg-[#E9E7FF]" />
                                    <div className="-ml-2 h-10 w-10 rounded-full bg-[#D6ECFF]" />
                                    <div className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#63B6FF]">
                                        <Globe size={16} className="text-white" />
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="w-[3px] rounded-full bg-[#9AC8FF]" />
                                    <div>
                                        <h3 className="text-[48px] font-medium leading-none tracking-[-0.04em] text-black">
                                            99%
                                        </h3>
                                        <p className="mt-2 text-[18px] text-[#444]">
                                            Global reach
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Stat 2 */}
                            <div>
                                <div className="mb-5 flex">
                                    <img
                                        src="https://i.pravatar.cc/40?img=1"
                                        className="h-10 w-10 rounded-full border-2 border-white"
                                        alt=""
                                    />
                                    <img
                                        src="https://i.pravatar.cc/40?img=2"
                                        className="-ml-3 h-10 w-10 rounded-full border-2 border-white"
                                        alt=""
                                    />
                                    <img
                                        src="https://i.pravatar.cc/40?img=3"
                                        className="-ml-3 h-10 w-10 rounded-full border-2 border-white"
                                        alt=""
                                    />
                                </div>

                                <div className="flex gap-4">
                                    <div className="w-[3px] rounded-full bg-[#9AC8FF]" />
                                    <div>
                                        <h3 className="text-[48px] font-medium leading-none tracking-[-0.04em] text-black">
                                            320K
                                        </h3>
                                        <p className="mt-2 text-[18px] text-[#444]">
                                            Number of users
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Stat 3 */}
                            <div>
                                <div className="mb-5 flex">
                                    <div className="h-10 w-10 rounded-full bg-[#E9E7FF]" />
                                    <div className="-ml-2 h-10 w-10 rounded-full bg-[#D6ECFF]" />
                                    <div className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#63B6FF]">
                                        <Clock3 size={16} className="text-white" />
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="w-[3px] rounded-full bg-[#9AC8FF]" />
                                    <div>
                                        <h3 className="text-[48px] font-medium leading-none tracking-[-0.04em] text-black">
                                            15ms
                                        </h3>
                                        <p className="mt-2 text-[18px] text-[#444]">
                                            Avg. response time
                                        </p>
                                    </div>
                                </div>
                            </div>

                        </div>

                        {/* Row 2 */}
                        <div className="grid grid-cols-3 gap-10">

                            {/* Stat 4 */}
                            <div>
                                <div className="mb-5 flex">
                                    <div className="h-10 w-10 rounded-full bg-[#E9E7FF]" />
                                    <div className="-ml-2 h-10 w-10 rounded-full bg-[#D6ECFF]" />
                                    <div className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#63B6FF]">
                                        <Building2 size={16} className="text-white" />
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="w-[3px] rounded-full bg-[#9AC8FF]" />
                                    <div>
                                        <h3 className="text-[48px] font-medium leading-none tracking-[-0.04em] text-black">
                                            12K+
                                        </h3>
                                        <p className="mt-2 text-[18px] text-[#444]">
                                            Events listed
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Stat 5 */}
                            <div>
                                <div className="mb-5 flex">
                                    <img
                                        src="https://i.pravatar.cc/40?img=4"
                                        className="h-10 w-10 rounded-full border-2 border-white"
                                        alt=""
                                    />
                                    <img
                                        src="https://i.pravatar.cc/40?img=5"
                                        className="-ml-3 h-10 w-10 rounded-full border-2 border-white"
                                        alt=""
                                    />
                                    <img
                                        src="https://i.pravatar.cc/40?img=6"
                                        className="-ml-3 h-10 w-10 rounded-full border-2 border-white"
                                        alt=""
                                    />
                                </div>

                                <div className="flex gap-4">
                                    <div className="w-[3px] rounded-full bg-[#9AC8FF]" />
                                    <div>
                                        <h3 className="text-[48px] font-medium leading-none tracking-[-0.04em] text-black">
                                            180+
                                        </h3>
                                        <p className="mt-2 text-[18px] text-[#444]">
                                            Countries
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Stat 6 */}
                            <div>
                                <div className="mb-5 flex">
                                    <div className="h-10 w-10 rounded-full bg-[#E9E7FF]" />
                                    <div className="-ml-2 h-10 w-10 rounded-full bg-[#D6ECFF]" />
                                    <div className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#63B6FF]">
                                        <Handshake size={16} className="text-white" />
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="w-[3px] rounded-full bg-[#9AC8FF]" />
                                    <div>
                                        <h3 className="text-[48px] font-medium leading-none tracking-[-0.04em] text-black">
                                            4.2M+
                                        </h3>
                                        <p className="mt-2 text-[18px] text-[#444]">
                                            Annual visitors
                                        </p>
                                    </div>
                                </div>
                            </div>

                        </div>

                    </div>

                </div>
            </div>
        </section>
    )
}