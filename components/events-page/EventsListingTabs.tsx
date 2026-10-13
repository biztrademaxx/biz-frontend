"use client"

import { ShieldCheck } from "lucide-react"

export function EventsListingTabs({
  tabs,
  activeTab,
  onTabChange,
}: {
  tabs: string[]
  activeTab: string
  onTabChange: (tab: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-1 sm:gap-2 mb-6 border-b border-gray-300 overflow-x-auto">
      {tabs.map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => onTabChange(tab)}
          className={`px-4 py-3 text-sm sm:text-base font-bold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === tab
              ? "border-blue-600 text-blue-700 bg-blue-50"
              : "border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-100"
          }`}
        >
          {tab === "Verified" ? (
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-10 h-10" />
              Verified
            </span>
          ) : (
            tab
          )}
        </button>
      ))}
    </div>
  )
}
