"use client"

import { clearTokens } from "@/lib/api"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { User, Calendar, Users, MessageSquare, Settings } from "lucide-react"

const sidebarItems = [
  {
    title: "Profile",
    icon: User,
    id: "profile",
  },
  {
    title: "Events",
    icon: Calendar,
    id: "events",
  },
  {
    title: "Connections",
    icon: Users,
    id: "connections",
  },
  {
    title: "Messages",
    icon: MessageSquare,
    id: "messages",
  },
  {
    title: "Settings",
    icon: Settings,
    id: "settings",
  },
]

interface DashboardSidebarProps {
  activeSection: string
  setActiveSection: (section: string) => void
  userData: any
}

export function DashboardSidebar({ activeSection, setActiveSection, userData }: DashboardSidebarProps) {
  const router = useRouter()
  return (
    <Sidebar className="border-r">
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={userData.avatar || "/city/c4.jpg"} />
            <AvatarFallback>RS</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-semibold">{userData.name}</div>
            <div className="text-sm text-gray-600">{userData.title}</div>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {sidebarItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => setActiveSection(item.id)}
                    isActive={activeSection === item.id}
                    className="w-full justify-start"
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <Button
                  onClick={() => { clearTokens(); router.push("/login"); }}
                  className="w-full bg-red-500 hover:bg-red-600 text-white mt-20 "
                >
                  Logout
                </Button>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
