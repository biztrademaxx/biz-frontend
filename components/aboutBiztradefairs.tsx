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
} from "lucide-react"
import Link from "next/link"

export default function AboutBizTrade() {
    return (
        <section className="relative overflow-hidden bg-white py-20">

            <div className="relative mx-auto max-w-[1400px] px-6 lg:px-10">

                {/* ── MAIN GRID: Globe left, Content right ── */}
                <div className="grid items-center gap-10 lg:grid-cols-[52%_48%]">

                    {/* ── LEFT: Globe (no background) ── */}
                    <div className="relative flex min-h-[560px] items-center justify-center">

                        {/* Globe image — no background, no rings */}
                        <img
                            src="/images/globe.png"
                            alt="Global Network Globe"
                            className="relative z-10 h-[440px] w-[440px] select-none object-contain"
                        />

                        {/* Floating badge: Global Network */}
                        <div className="absolute left-4 top-16 z-20 flex flex-col items-center gap-1.5 rounded-2xl border border-blue-100 bg-white px-5 py-4 shadow-[0_4px_24px_rgba(59,130,246,0.12)] transition-transform duration-300 hover:-translate-y-1 sm:left-10">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                                <Users className="text-blue-600" size={22} />
                            </div>
                            <p className="text-center text-[12px] font-semibold text-slate-700">
                                Global<br />Network
                            </p>
                        </div>

                        {/* Floating badge: Verified Exhibitors */}
                        <div className="absolute right-4 top-16 z-20 flex flex-col items-center gap-1.5 rounded-2xl border border-blue-100 bg-white px-5 py-4 shadow-[0_4px_24px_rgba(59,130,246,0.12)] transition-transform duration-300 hover:-translate-y-1 sm:right-10">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                                <Building2 className="text-blue-600" size={22} />
                            </div>
                            <p className="text-center text-[12px] font-semibold text-slate-700">
                                Verified<br />Exhibitors
                            </p>
                        </div>

                        {/* Floating badge: Quality Events */}
                        <div className="absolute bottom-16 left-4 z-20 flex flex-col items-center gap-1.5 rounded-2xl border border-blue-100 bg-white px-5 py-4 shadow-[0_4px_24px_rgba(59,130,246,0.12)] transition-transform duration-300 hover:-translate-y-1 sm:left-10">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                                <CalendarDays className="text-blue-600" size={22} />
                            </div>
                            <p className="text-center text-[12px] font-semibold text-slate-700">
                                Quality<br />Events
                            </p>
                        </div>

                        {/* Floating badge: Business Connections */}
                        <div className="absolute bottom-16 right-4 z-20 flex flex-col items-center gap-1.5 rounded-2xl border border-blue-100 bg-white px-5 py-4 shadow-[0_4px_24px_rgba(59,130,246,0.12)] transition-transform duration-300 hover:-translate-y-1 sm:right-10">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                                <Handshake className="text-blue-600" size={22} />
                            </div>
                            <p className="text-center text-[12px] font-semibold text-slate-700">
                                Business<br />Connections
                            </p>
                        </div>
                    </div>

                    {/* ── RIGHT: Content ── */}
                    <div className="flex flex-col">

                        {/* Label */}
                        <div className="mb-5 flex items-center gap-3">
                            <div className="h-[2px] w-10 bg-blue-700" />
                            <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-blue-700">
                                About BizTrade Fairs
                            </span>
                        </div>

                        {/* Heading */}
                        <h2 className="text-[36px] font-extrabold leading-[1.1] tracking-tight text-slate-900 lg:text-[44px]">
                            Connecting Buyers,<br />
                            Exhibitors &amp; Industry<br />
                            Leaders Worldwide
                        </h2>

                        {/* Blue underline accent */}
                        <div className="mt-4 h-[3px] w-10 rounded-full bg-blue-600" />

                        {/* Description */}
                        <p className="mt-6 text-[15.5px] leading-[1.75] text-slate-500">
                            BizTrade Fairs is the world's most comprehensive platform for
                            discovering trade shows, exhibitions and business events.
                            We connect businesses with the right opportunities to
                            grow, network and expand globally.
                        </p>

                        {/* Stats */}
                        <div className="mt-10 grid grid-cols-3 gap-4">
                            {[
                                { icon: CalendarDays, value: "12K+", label: "Events", sub: "Across all industries" },
                                { icon: Globe, value: "180+", label: "Countries", sub: "Global coverage" },
                                { icon: Users, value: "4.2M+", label: "Visitors", sub: "Every year" },
                            ].map(({ icon: Icon, value, label, sub }) => (
                                <div
                                    key={label}
                                    className="flex flex-col items-start gap-2 rounded-2xl border border-blue-100 bg-white px-4 py-5 shadow-sm"
                                >
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                                        <Icon className="text-blue-600" size={20} />
                                    </div>
                                    <p className="text-[28px] font-extrabold leading-none tracking-tight text-blue-600">
                                        {value}
                                    </p>
                                    <div>
                                        <p className="text-[13px] font-bold text-slate-800">{label}</p>
                                        <p className="text-[11.5px] text-slate-400">{sub}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* CTA — right side only */}
                        <div className="mt-8">
                            <Link
                                href="/event"
                                className="inline-flex items-center gap-3 rounded-xl bg-blue-700 px-8 py-4 text-[15px] font-semibold text-white shadow-md transition-all duration-200 hover:bg-blue-800 hover:shadow-lg"
                            >
                                Explore Events
                                <ArrowRight size={18} />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* ── TRUST STRIP — full width below both columns ── */}
                <div className="mt-12 grid grid-cols-2 gap-3 rounded-2xl border border-blue-100 bg-white p-5 shadow-sm sm:grid-cols-4">
                    {[
                        {
                            icon: ShieldCheck,
                            title: "Trusted Platform",
                            sub: "Verified events and reliable information",
                        },
                        {
                            icon: Users,
                            title: "Global Reach",
                            sub: "Connect with businesses across 180+ countries",
                        },
                        {
                            icon: TrendingUp,
                            title: "Business Growth",
                            sub: "Find new opportunities and grow your network",
                        },
                        {
                            icon: HeadphonesIcon,
                            title: "Dedicated Support",
                            sub: "Our team is here to help you succeed",
                        },
                    ].map(({ icon: Icon, title, sub }, i, arr) => (
                        <div
                            key={title}
                            className={`flex items-start gap-3 ${i < arr.length - 1 ? "border-r border-blue-50 pr-4" : ""}`}
                        >
                            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50">
                                <Icon className="text-blue-600" size={17} />
                            </div>
                            <div>
                                <p className="text-[13px] font-bold text-slate-800">{title}</p>
                                <p className="mt-0.5 text-[11.5px] leading-[1.5] text-slate-400">{sub}</p>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    )
}