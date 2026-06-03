/**
 * VIP strip loading — same geometry as HeroSlideshowClient EventCard, neutral gray shimmer only
 * (no brand / accent colors).
 */
// function VipEventCardSkeleton() {
//   return (
//     <div
//       className="relative h-[448px] w-full min-w-0 overflow-hidden rounded-sm bg-neutral-200/80 ring-1 ring-neutral-300/50 md:h-[488px] lg:h-[528px]"
//       aria-hidden
//     >
//       <div className="hero-card-shimmer absolute inset-0 h-full w-full" />

//       <div
//         className="pointer-events-none absolute inset-0 bg-gradient-to-t from-neutral-900/40 via-neutral-900/14 to-transparent"
//         aria-hidden
//       />

//       <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
//         <div className="mb-3 flex w-full max-w-[min(100%,6.25rem)] flex-col items-start gap-2 md:mb-4 lg:max-w-[min(100%,5.75rem)]">
//           <div className="home-shimmer h-6 w-[5.75rem] shrink-0 rounded-sm shadow-sm ring-1 ring-neutral-300/40" />
//           <div className="home-shimmer relative w-full min-h-[5.25rem] overflow-hidden rounded-md shadow-md ring-1 ring-neutral-300/50 md:min-h-[5.75rem] lg:min-h-[6rem]">
//             <div className="relative z-10 flex h-full min-h-[5.25rem] flex-col items-center justify-center gap-1.5 px-2 py-2 md:min-h-[5.75rem] lg:min-h-[6rem]">
//               <div className="home-shimmer h-8 w-11 rounded-md opacity-90" />
//               <div className="home-shimmer h-2.5 w-14 rounded-md opacity-80" />
//               <div className="home-shimmer h-2 w-9 rounded-md opacity-75" />
//             </div>
//           </div>
//         </div>

//         <div className="mb-2 space-y-2">
//           <div className="home-shimmer h-6 w-[92%] max-w-md rounded-md md:h-7" />
//           <div className="home-shimmer h-6 w-[72%] max-w-sm rounded-md md:h-7" />
//         </div>

//         <div className="flex items-center gap-2 pt-0.5">
//           <div className="home-shimmer h-4 w-4 shrink-0 rounded-sm" />
//           <div className="home-shimmer h-4 w-36 max-w-[70%] rounded-md" />
//         </div>
//       </div>
//     </div>
//   )
// }

// /** Matches VIP strip: horizontal scroll on small screens, 5 columns on large. */
// export default function HeroSlideshowSkeleton() {
//   return (
//     <div className="relative w-full min-w-0 pt-0 pb-3" aria-busy="true" aria-label="Loading VIP events">
//       <div className="no-scrollbar flex w-full snap-x snap-mandatory gap-0 overflow-x-auto overflow-y-hidden">
//         {Array.from({ length: 5 }).map((_, i) => (
//           <div
//             key={i}
//             className="w-[min(100%,88vw)] shrink-0 snap-start sm:w-80 lg:w-1/5 lg:min-w-0"
//           >
//             <VipEventCardSkeleton />
//           </div>
//         ))}
//       </div>
//     </div>
//   )
// }

export default function HeroSlideshowSkeleton() {
  return (
    <section
      className="relative w-full overflow-hidden rounded-[28px] bg-white"
      aria-busy="true"
    >
      <div className="relative z-10 w-full max-w-7xl mx-auto px-8 lg:px-12">
        <div className="flex flex-col lg:flex-row lg:items-start gap-12 lg:gap-16 pt-23 pb-8">

          {/* LEFT SIDE */}
          <div className="w-full lg:w-[32%]">
            <div className="space-y-3">
              <div className="home-shimmer h-[65px] w-[280px] rounded-md" />
              <div className="home-shimmer h-[65px] w-[320px] rounded-md" />
              <div className="home-shimmer h-[65px] w-[260px] rounded-md" />
            </div>

            <div className="mt-20 space-y-2">
              <div className="home-shimmer h-4 w-full max-w-[340px] rounded" />
              <div className="home-shimmer h-4 w-[85%] rounded" />
            </div>

            <div className="flex gap-8 mt-12">
              {[1, 2, 3].map((i) => (
                <div key={i}>
                  <div className="home-shimmer h-8 w-16 rounded" />
                  <div className="home-shimmer h-3 w-20 rounded mt-2" />
                </div>
              ))}
            </div>

            <div className="flex gap-4 mt-16 max-w-[360px]">
              <div className="home-shimmer h-12 flex-1 rounded-sm" />
              <div className="home-shimmer h-12 flex-1 rounded-sm" />
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="w-full lg:w-[65%] flex flex-col gap-5">
            <div className="home-shimmer h-[400px] w-full rounded-xl" />

            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="home-shimmer h-2 w-8 rounded-full"
                />
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="home-shimmer w-[68px] h-[68px] rounded-sm" />
                  <div className="flex-1">
                    <div className="home-shimmer h-4 w-full rounded" />
                    <div className="home-shimmer h-3 w-24 rounded mt-2" />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}