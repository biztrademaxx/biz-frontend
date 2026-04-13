"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bell } from "lucide-react"

interface DashboardHeaderProps {
  userData: any
}

export function DashboardHeader({ userData }: DashboardHeaderProps) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 m">
      <SidebarTrigger className="-ml-1" />
      <div className="flex items-center gap-2 ml-auto">
        <Button variant="ghost" size="sm">
          <Bell className="w-4 h-4" />
        </Button>
        <Avatar className="w-8 h-8">
          <AvatarImage src={userData.avatar || "/placeholder.svg"} />
          <AvatarFallback>RS</AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
