export default function HeroBrandContent() {
    return (
        <div className="flex h-full flex-col justify-center px-8 py-10 lg:px-14">

            {/* Badge */}
            <div className="mb-6 flex w-fit items-center gap-2 rounded-full bg-blue-50 px-4 py-2">
                <span className="h-2 w-2 rounded-full bg-blue-600" />
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
                    Global Trade Network
                </span>
            </div>

            {/* Main Heading */}
            <h1 className="max-w-[650px] font-display text-[3rem] font-extrabold leading-[1.05] tracking-tight text-slate-900 lg:text-[5rem]">
                Global Trade
                <br />
                Shows &
                <br />
                Exhibitions
            </h1>

            {/* Description */}
            <p className="mt-6 max-w-[620px] text-lg leading-8 text-slate-600">
                Discover 12,000+ trade shows and exhibitions across
                180+ countries. Connect with buyers, exhibitors,
                investors and industry leaders worldwide.
            </p>
            {/* Stats */}
            <div className="mt-10 flex gap-10">

                <div>
                    <h3 className="text-4xl font-bold text-slate-900">
                        12K+
                    </h3>
                    <p className="mt-1 text-slate-500">
                        Events
                    </p>
                </div>

                <div>
                    <h3 className="text-4xl font-bold text-slate-900">
                        180+
                    </h3>
                    <p className="mt-1 text-slate-500">
                        Countries
                    </p>
                </div>

                <div>
                    <h3 className="text-4xl font-bold text-slate-900">
                        4.2M+
                    </h3>
                    <p className="mt-1 text-slate-500">
                        Visitors
                    </p>
                </div>

            </div>

            {/* Buttons */}
            <div className="mt-10 flex gap-4">

                <a
                    href="/event"
                    className="rounded-xl bg-blue-600 px-8 py-4 font-semibold text-white transition hover:bg-blue-700"
                >
                    Browse Events
                </a>

                <a
                    href="/organizer-signup"
                    className="rounded-xl border border-slate-300 bg-white px-8 py-4 font-semibold text-slate-700 transition hover:border-slate-400"
                >
                    List Your Event
                </a>

            </div>

        </div>
    )
}