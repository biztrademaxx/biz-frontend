export default function HeroBrandContent() {
    return (
        <div className="flex flex-col px-10 py-12 lg:px-14 lg:py-16">
            {/* Eyebrow badge */}
            <div className="mb-7 flex w-fit items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                <span className="text-[11px] font-medium uppercase tracking-widest text-blue-600">
                    Global Trade Network
                </span>
            </div>

            {/* Brand name */}
            <h1 className="mb-3 font-['Syne',sans-serif] text-[2.75rem] font-extrabold leading-[1.04] tracking-tight text-gray-900 lg:text-5xl">
                Biz<span className="text-blue-600">Trade</span>
                <br />Fairs
            </h1>

            {/* Tagline */}
            <p className="mb-8 max-w-[300px] text-sm font-light leading-relaxed text-gray-500">
                The world's most comprehensive B2B trade fair platform — connecting
                buyers, exhibitors &amp; industry leaders across 180+ countries.
            </p>

            {/* Stats */}
            <div className="mb-9 flex overflow-hidden rounded-xl border border-gray-100">
                <div className="flex-1 border-r border-gray-100 px-4 py-3 text-center">
                    <p className="font-['Syne',sans-serif] text-lg font-bold text-gray-900">12K+</p>
                    <p className="mt-1 text-[10px] uppercase tracking-wider text-gray-400">Events</p>
                </div>
                <div className="flex-1 border-r border-gray-100 px-4 py-3 text-center">
                    <p className="font-['Syne',sans-serif] text-lg font-bold text-gray-900">180+</p>
                    <p className="mt-1 text-[10px] uppercase tracking-wider text-gray-400">Countries</p>
                </div>
                <div className="flex-1 px-4 py-3 text-center">
                    <p className="font-['Syne',sans-serif] text-lg font-bold text-gray-900">4.2M</p>
                    <p className="mt-1 text-[10px] uppercase tracking-wider text-gray-400">Visitors</p>
                </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3">
                <a
                    href="/event"
                    className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                >
                    Browse Events
                </a>
                <a
                    href="/organizer-signup"
                    className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-normal text-gray-600 transition-colors hover:border-gray-400 hover:text-gray-900"
                >
                    List Your Event
                </a>
            </div>
        </div>
    )
}