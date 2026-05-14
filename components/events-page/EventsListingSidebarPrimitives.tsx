"use client"

import { ChevronDown } from "lucide-react"

export function SidebarSection({
  title,
  open,
  onToggle,
  children,
}: {
  title: string
  open: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <div className="border-b border-gray-200">
      <button
        type="button"
        onClick={onToggle}
        className="
          w-full flex items-center justify-between
          px-4 py-3
          text-sm font-semibold
          text-gray-400
          hover:text-red-600
          transition-colors
        "
      >
        <span>{title}</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform text-green-700 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && <div className="pb-2">{children}</div>}
    </div>
  )
}

export function SidebarCheckboxRow({
  label,
  count,
  checked,
  onChange,
}: {
  label: string
  count?: number
  checked: boolean
  onChange: () => void
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onChange}
      onKeyDown={(ev) => {
        if (ev.key === "Enter" || ev.key === " ") {
          ev.preventDefault()
          onChange()
        }
      }}
      className={`
        flex items-center justify-between
        px-4 py-2 text-sm cursor-pointer
        rounded-md
        transition-colors
        hover:text-red-500
        ${checked ? "bg-green-50 text-red-500" : "text-gray-800 hover:bg-green-50"}
      `}
    >
      <div className="flex items-center gap-3 min-w-0">
        <input type="checkbox" checked={checked} readOnly className="w-4 h-4 accent-green-600" />
        <span className={`truncate ${checked ? "font-semibold" : "font-normal"}`}>{label}</span>
      </div>

      {typeof count === "number" && <span className="text-xs text-gray-500">{count}</span>}
    </div>
  )
}
