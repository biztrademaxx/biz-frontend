export default function ComingSoonBanner() {
    return (
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black text-white px-6">
  
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-[#020617] to-purple-900 opacity-90" />
  
        {/* Glow effects */}
        <div className="absolute -top-32 -left-32 h-[400px] w-[400px] rounded-full bg-blue-500 opacity-20 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-[400px] w-[400px] rounded-full bg-purple-500 opacity-20 blur-3xl" />
  
        {/* Extra soft glow */}
        <div className="absolute inset-0 opacity-10 blur-2xl bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400" />
  
        {/* Content */}
        <div className="relative z-10 text-center max-w-3xl mx-auto">
  
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-sm text-gray-300 backdrop-blur">
            🚀 Launching Soon
          </div>
  
          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight">
            Something Big is
            <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Coming Soon
            </span>
          </h1>
  
          {/* Subtitle */}
          <p className="mt-6 text-lg text-gray-300">
            We are building the future of trade fairs, networking, and global business connections.
          </p>
  
          {/* CTA */}
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <button className="rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-4 font-semibold shadow-lg hover:opacity-90 transition">
              Join Waitlist
            </button>
  
            <button className="rounded-xl border border-white/20 px-8 py-4 hover:bg-white hover:text-black transition">
              Explore Events
            </button>
          </div>
  
          {/* Bottom note */}
          <p className="mt-8 text-sm text-gray-400">
            Built for organizers, exhibitors & global businesses
          </p>
  
        </div>
      </section>
    );
  }