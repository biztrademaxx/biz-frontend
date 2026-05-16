"use client"

import { devLog } from "@/lib/dev-log"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import {
  ChevronDown,
  User,
  LogOut,
  Settings,
  Search,
  MessageSquare,
} from "lucide-react"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { AdminNotificationsDropdown } from "@/components/AdminNotificationsDropdown"
import { clearTokens, markLogoutSuccessBanner } from "@/lib/api"
import { useAuth } from "@/hooks/use-auth"
import { cn } from "@/lib/utils"
import { AdminThemeToggle } from "@/components/admin-theme-toggle"

type NavbarProps = { onLogout?: () => void }

export default function Navbar({ onLogout }: NavbarProps) {
  const pathname = usePathname()
  const isAdminDashboard = pathname?.startsWith("/admin-dashboard") ?? false
  const { role } = useAuth({ requireAuth: false })
  const [exploreOpen, setExploreOpen] = useState(false)
  const router = useRouter()

  const toggleExplore = () => setExploreOpen((prev) => !prev)

  const handleLogout = () => {
    markLogoutSuccessBanner()
    clearTokens()
    localStorage.removeItem("superAdminToken")
    localStorage.removeItem("superAdmin")
    if (onLogout) onLogout()
    else router.push("/login")
  }

  const navigateToProfile = () => {
    devLog("Navigate to profile")
  }

  const navigateToSettings = () => {
    devLog("Navigate to settings")
  }

  const roleLabel =
    role === "SUPER_ADMIN"
      ? "Super Admin"
      : role === "SUB_ADMIN"
        ? "Sub Admin"
        : "Administrator"

  if (isAdminDashboard) {
    return (
      <header
        className={cn(
          "sticky top-0 z-40 shrink-0 border-b border-border",
          "bg-background/90 backdrop-blur-md supports-[backdrop-filter]:bg-background/75",
        )}
      >
        <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:gap-4 lg:px-8">
          <div className="min-w-0 flex-1 md:flex md:justify-center">
            <div className="relative mx-auto w-full max-w-xl">
              <div className="relative hidden md:block">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  readOnly
                  placeholder="Search events, users, venues…"
                  className="h-10 rounded-full border-border bg-muted/60 pl-10 pr-14 text-sm text-foreground shadow-inner"
                  aria-label="Search (shortcut)"
                />
                <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 select-none rounded-md border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground sm:inline-block">
                  ⌘ K
                </kbd>
              </div>
              <div className="relative md:hidden">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  readOnly
                  placeholder="Search…"
                  className="h-10 w-full rounded-full border-border bg-muted/60 pl-9 text-sm text-foreground"
                  aria-label="Search"
                />
              </div>
            </div>
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-0.5 sm:gap-1">
            <AdminThemeToggle />
            <AdminNotificationsDropdown triggerButtonClassName="hover:bg-accent text-muted-foreground hover:text-foreground" />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full text-muted-foreground hover:bg-accent hover:text-foreground"
              aria-label="Messages"
            >
              <MessageSquare className="h-5 w-5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="ml-1 flex items-center gap-2 rounded-2xl py-1 pl-1 pr-2 transition-colors hover:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Avatar className="h-9 w-9 border border-border shadow-sm">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-xs font-semibold text-white">
                      A
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden text-left leading-tight lg:block">
                    <p className="text-sm font-semibold text-foreground">Admin</p>
                    <p className="text-xs text-muted-foreground">{roleLabel}</p>
                  </div>
                  <ChevronDown className="hidden h-4 w-4 text-muted-foreground lg:block" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuItem onClick={navigateToProfile}>
                  <User className="mr-2 h-4 w-4" />
                  <span>My Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={navigateToSettings}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
    )
  }

  return (
    <nav className="border-b bg-white shadow-sm">
      <div className="mx-auto max-w-full px-4 py-2 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-6">
            <Link href="/" className="inline-block">
              <Image
                src="/logo/bizlogo.png"
                alt="BizTradeFairs.com"
                width={160}
                height={80}
                className="h-10 w-auto"
              />
            </Link>

            <div className="relative">
              <button
                type="button"
                onClick={toggleExplore}
                className="flex items-center text-gray-700 hover:text-gray-900 focus:outline-none"
              >
                <span>Explore</span>
                <ChevronDown className="ml-1 w-4 h-4" />
              </button>

              {exploreOpen && (
                <div className="absolute left-0 z-10 mt-2 w-48 rounded-md border border-gray-200 bg-white shadow-lg">
                  <ul className="py-1">
                    <li>
                      <Link href="/trade-fairs">
                        <p className="block px-4 py-2 hover:bg-gray-100">Trade Fairs</p>
                      </Link>
                    </li>
                    <li>
                      <Link href="/conferences">
                        <p className="block px-4 py-2 hover:bg-gray-100">Conferences</p>
                      </Link>
                    </li>
                    <li>
                      <Link href="/webinars">
                        <p className="block px-4 py-2 hover:bg-gray-100">Webinars</p>
                      </Link>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <Link href="/event">
              <p className="text-gray-700 hover:text-gray-900">Top 10 Must Visit</p>
            </Link>
            <Link href="/speakers">
              <p className="text-gray-700 hover:text-gray-900">Speakers</p>
            </Link>
            <Link href="/admin-dashboard">
              <p className="cursor-pointer text-gray-700 hover:text-gray-900">Admin Dashboard</p>
            </Link>

            <AdminNotificationsDropdown />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-full bg-[#002C71] p-2 text-white transition-colors hover:bg-blue-800 focus:outline-none"
                >
                  <User className="h-4 w-4" />
                  <ChevronDown className="h-3 w-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuItem onClick={navigateToProfile}>
                  <User className="mr-2 h-4 w-4" />
                  <span>My Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={navigateToSettings}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  )
}
