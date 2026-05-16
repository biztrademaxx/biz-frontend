"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown, User, LogOut, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { isAuthenticated, getCurrentUserId, getCurrentUserRole, clearTokens, markLogoutSuccessBanner } from "@/lib/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useDashboard } from "@/contexts/dashboard-context";
import { NotificationsDropdown } from "@/components/notifications-dropdown";

export default function Navbar() {
  const [exploreOpen, setExploreOpen] = useState(false);
  const router = useRouter();
  const { setActiveSection } = useDashboard();

  const toggleExplore = () => setExploreOpen((prev) => !prev);

  const handleAddevent = () => {
    if (!isAuthenticated()) {
      alert("You are not logged in. Please login as an organizer.");
      router.push("/login");
      return;
    }

    const role = getCurrentUserRole();
    const id = getCurrentUserId();
    if (role === "VENUE_MANAGER" || role === "venue_manager") {
      router.push("/venue-dashboard")
    } else {
      const confirmed = window.confirm(
        `You are logged in as '${role ?? "user"}'.\n\nPlease login as an organizer to access this page.\n\nClick OK to logout and login as an organizer, or Cancel to stay logged in.`
      );
      if (confirmed) {
        markLogoutSuccessBanner();
        clearTokens();
        router.push("/login");
      }
    }
  };

  const handleLogout = () => {
    markLogoutSuccessBanner();
    clearTokens();
    router.push("/login");
  };

  // Navigation functions using dashboard context
  const navigateToProfile = () => {
    setActiveSection("venue-profile");
  };

  const navigateToSettings = () => {
    setActiveSection("settings");
  };

  return (
    <nav className="sticky top-0 z-40 border-b border-violet-100/40 bg-white/65 shadow-[0_10px_36px_-16px_rgba(138,112,214,0.12)] backdrop-blur-xl">
      <div className="mx-auto max-w-[1920px] px-4 sm:px-6 lg:px-8 py-2">
        <div className="flex justify-between h-20 items-center">
          {/* Left: Logo + Explore */}
          <div className="flex items-center space-x-6">
            <Link href="/" className="inline-block">
              <Image
                src="/logo/bizlogo.png"
                alt="BizTradeFairs.com"
                width={160}
                height={80}
                className="h-42 w-auto"
              />
            </Link>

            <div className="relative">
              {/* <button
                onClick={toggleExplore}
                className="flex items-center text-gray-700 hover:text-gray-900 focus:outline-none"
              >
                <span>Explore</span>
                <ChevronDown className="w-4 h-4 ml-1" />
              </button> */}

              {exploreOpen && (
                <div className="absolute left-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                  <ul className="py-1">
                    <li>
                      <Link href="/trade-fairs">
                        <p className="block px-4 py-2 hover:bg-gray-100">
                          Trade Fairs
                        </p>
                      </Link>
                    </li>
                    <li>
                      <Link href="/conferences">
                        <p className="block px-4 py-2 hover:bg-gray-100">
                          Conferences
                        </p>
                      </Link>
                    </li>
                    <li>
                      <Link href="/webinars">
                        <p className="block px-4 py-2 hover:bg-gray-100">
                          Webinars
                        </p>
                      </Link>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Right: Links + Profile */}
          <div className="flex items-center space-x-6">
            <Link href="/event">
              <p className="text-slate-600 transition-colors hover:text-violet-700">
                Top 10 Must Visit
              </p>
            </Link>
            <Link href="/speakers">
              <p className="text-slate-600 transition-colors hover:text-violet-700">Speakers</p>
            </Link>
            <p
              onClick={handleAddevent}
              className="cursor-pointer text-slate-600 transition-colors hover:text-violet-700"
            >
              Add Event
            </p>

            {/* Notifications Dropdown */}
            <NotificationsDropdown />

            {/* Profile Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-sky-500 p-2 text-white shadow-md shadow-violet-500/25 transition-all hover:from-violet-500 hover:to-sky-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2">
                  <User className="w-4 h-4" />
                  <ChevronDown className="w-3 h-3" />
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
  );
}