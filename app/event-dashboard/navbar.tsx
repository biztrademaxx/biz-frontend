"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown, User, LogOut, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { isAuthenticated, getCurrentUserRole, clearTokens } from "@/lib/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { NotificationsDropdown } from "@/components/notifications-dropdown";

export default function Navbar() {
  const [exploreOpen, setExploreOpen] = useState(false);
  const authenticated = isAuthenticated();
  const role = getCurrentUserRole();
  const router = useRouter();

  const toggleExplore = () => setExploreOpen((prev) => !prev);

  const handleAddevent = () => {
    if (!authenticated) {
      alert("You are not logged in. Please login as an organizer.");
      router.push("/login");
      return;
    }
    const roleUpper = (role || "").toUpperCase();
    if (roleUpper === "ORGANIZER") {
      router.push("/organizer-dashboard");
    } else {
      const confirmed = window.confirm(
        `You are logged in as '${roleUpper}'.\n\nPlease login as an organizer to access this page.\n\nClick OK to logout and login as an organizer, or Cancel to stay logged in.`
      );
      if (confirmed) {
        clearTokens();
        router.push("/login");
      }
    }
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-1xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
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
          <div className="flex items-center space-x-4">
            <Link href="/event">
              <p className="text-gray-700 hover:text-gray-900">
                Top 10 Must Visit
              </p>
            </Link>
            <Link href="/speakers">
              <p className="text-gray-700 hover:text-gray-900">Speakers</p>
            </Link>
            <p
              onClick={handleAddevent}
              className="text-gray-700 hover:text-gray-900 cursor-pointer"
            >
              Add Event
            </p>

            {/* Notifications */}
            <NotificationsDropdown />

            {/* Profile Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-2 rounded-full bg-[#002C71] text-white hover:bg-gray-100 focus:outline-none">
                  <User className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>My Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => { clearTokens(); router.push("/login"); }}>
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