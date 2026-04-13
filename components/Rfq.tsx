"use client";

import { useState } from "react";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(email);
  };

  return (
    <section className="mx-auto w-full min-w-0 max-w-7xl px-4 py-8 sm:py-9">
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{
          backgroundImage:
            "url('/images/news.jpeg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* GRADIENT OVERLAY */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 via-indigo-900/80 to-red-600/80" />

        {/* CONTENT */}
        <div className="relative z-10 grid gap-6 px-4 py-6 sm:gap-8 sm:px-8 sm:py-8 md:grid-cols-2">

          {/* LEFT SIDE */}
          <div className="space-y-4 text-white sm:space-y-5">
            <h2 className="text-2xl font-bold leading-snug sm:text-3xl md:text-[2rem]">
              Stay Updated with <br /> BizTradeFairs
            </h2>

            <p className="text-white/80 text-sm md:text-base leading-relaxed max-w-md">
              Get the latest updates on <span className="font-semibold text-white">Trade Fairs, Exhibitions, Industry</span> News and Exclusive Business Opportunities worldwide.
            </p>

            <ul className="space-y-3 text-white/90">
              <li className="flex items-center gap-2">
                <span className="text-green-400 text-lg">✔</span>
                Weekly Trade Fair Alerts
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400 text-lg">✔</span>
                Exclusive Exhibitor Opportunities
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400 text-lg">✔</span>
                Industry Trends & Insights
              </li>
            </ul>
          </div>

          {/* RIGHT SIDE */}
          <div className="flex flex-col justify-center">

            <h3 className="mb-5 text-xl font-semibold text-white sm:mb-6 sm:text-2xl">
              Subscribe to Our <br /> Newsletter
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 max-w-md">

              {/* INPUT */}
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              />

              {/* BUTTON */}
              <button
                type="submit"
                className="w-full py-3 rounded-lg font-semibold text-white 
                bg-gradient-to-r from-red-600 to-orange-500 
                hover:from-red-700 hover:to-orange-600 
                transition-all shadow-lg"
              >
                Subscribe Now
              </button>

              {/* TERMS */}
              <p className="text-xs text-white/60">
                By subscribing, you agree to our{" "}
                <span className="underline cursor-pointer">
                  Terms & Conditions
                </span>
              </p>
            </form>

          </div>
        </div>
      </div>
    </section>
  );
}