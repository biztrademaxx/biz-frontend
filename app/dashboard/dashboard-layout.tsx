"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import {
  User,
  Calendar,
  Users,
  MessageSquare,
  Settings,
  Bell,
  Search,
  Edit,
  MapPin,
  Phone,
  Mail,
  Globe,
  Plus,
  MoreHorizontal,
} from "lucide-react"

export default function UserDashboard() {
  const [activeSection, setActiveSection] = useState("profile")

  // Mock user data
  const userData = {
    name: "Ramesh S",
    title: "CEO & Co-Founder",
    email: "ramesh@company.com",
    phone: "+91 9999787865",
    location: "Mumbai, India",
    website: "www.company.com",
    bio: "Experienced business leader with over 15 years in the industry. Passionate about innovation and building meaningful connections through events and conferences.",
    avatar: "/placeholder.svg?height=120&width=120&text=User",
    followers: 3032,
    following: 1250,
    eventsAttended: 45,
  }

  const upcomingEvents = [
    {
      id: 1,
      title: "Global Precision Expo 2025",
      date: "June 11-13, 2025",
      location: "Chennai Trade Centre",
      status: "Registered",
      type: "Exhibition",
    },
    {
      id: 2,
      title: "Tech Innovation Summit",
      date: "July 20-22, 2025",
      location: "Mumbai Convention Center",
      status: "Interested",
      type: "Conference",
    },
    {
      id: 3,
      title: "Fitness Fest 2025",
      date: "August 04-06, 2025",
      location: "Bangalore Sports Complex",
      status: "Speaking",
      type: "Festival",
    },
  ]

  const connections = [
    {
      id: 1,
      name: "Priya Sharma",
      title: "Marketing Director",
      company: "Tech Solutions Ltd",
      avatar: "/placeholder.svg?height=60&width=60&text=PS",
      mutualConnections: 12,
    },
    {
      id: 2,
      name: "Arjun Patel",
      title: "Event Manager",
      company: "Global Events Inc",
      avatar: "/placeholder.svg?height=60&width=60&text=AP",
      mutualConnections: 8,
    },
    {
      id: 3,
      name: "Sneha Reddy",
      title: "Business Development",
      company: "Innovation Hub",
      avatar: "/placeholder.svg?height=60&width=60&text=SR",
      mutualConnections: 15,
    },
  ]

  const messages = [
    {
      id: 1,
      sender: "Priya Sharma",
      message: "Hi Ramesh! Great meeting you at the conference. Would love to discuss potential collaboration.",
      time: "2 hours ago",
      unread: true,
      avatar: "/placeholder.svg?height=40&width=40&text=PS",
    },
    {
      id: 2,
      sender: "Event Organizer",
      message: "Thank you for registering for Global Precision Expo 2025. Here are your event details...",
      time: "1 day ago",
      unread: false,
      avatar: "/placeholder.svg?height=40&width=40&text=EO",
    },
    {
      id: 3,
      sender: "Arjun Patel",
      message: "Looking forward to your keynote at the upcoming summit!",
      time: "3 days ago",
      unread: false,
      avatar: "/placeholder.svg?height=40&width=40&text=AP",
    },
  ]

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

  const renderContent = () => {
    switch (activeSection) {
      case "profile":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
              <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                <Edit className="w-4 h-4" />
                Edit Profile
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profile Card */}
              <Card className="lg:col-span-1">
                <CardContent className="p-6 text-center">
                  <Avatar className="w-24 h-24 mx-auto mb-4">
                    <AvatarImage src={userData.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="text-2xl">RS</AvatarFallback>
                  </Avatar>
                  <h2 className="text-xl font-semibold mb-1">{userData.name}</h2>
                  <p className="text-gray-600 mb-4">{userData.title}</p>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="font-semibold text-lg">{userData.followers}</div>
                      <div className="text-sm text-gray-600">Followers</div>
                    </div>
                    <div>
                      <div className="font-semibold text-lg">{userData.following}</div>
                      <div className="text-sm text-gray-600">Following</div>
                    </div>
                    <div>
                      <div className="font-semibold text-lg">{userData.eventsAttended}</div>
                      <div className="text-sm text-gray-600">Events</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Profile Details */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-gray-500" />
                      <div>
                        <div className="font-medium">Email</div>
                        <div className="text-gray-600">{userData.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-gray-500" />
                      <div>
                        <div className="font-medium">Phone</div>
                        <div className="text-gray-600">{userData.phone}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-gray-500" />
                      <div>
                        <div className="font-medium">Location</div>
                        <div className="text-gray-600">{userData.location}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-gray-500" />
                      <div>
                        <div className="font-medium">Website</div>
                        <div className="text-gray-600">{userData.website}</div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="font-medium mb-2">Bio</div>
                    <p className="text-gray-600">{userData.bio}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )

      case "events":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-900">My Events</h1>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Event
              </Button>
            </div>

            <Tabs defaultValue="upcoming" className="w-full">
              <TabsList>
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                <TabsTrigger value="past">Past Events</TabsTrigger>
                <TabsTrigger value="speaking">Speaking</TabsTrigger>
              </TabsList>

              <TabsContent value="upcoming" className="space-y-4">
                {upcomingEvents.map((event) => (
                  <Card key={event.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">{event.title}</h3>
                            <Badge
                              variant={
                                event.status === "Registered"
                                  ? "default"
                                  : event.status === "Speaking"
                                    ? "destructive"
                                    : "secondary"
                              }
                            >
                              {event.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-gray-600">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {event.date}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {event.location}
                            </div>
                            <Badge variant="outline">{event.type}</Badge>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="past">
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-gray-600">No past events to display.</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="speaking">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">Fitness Fest 2025</h3>
                          <Badge variant="destructive">Speaking</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            August 04-06, 2025
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            Bangalore Sports Complex
                          </div>
                          <Badge variant="outline">Festival</Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )

      case "connections":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-900">Connections</h1>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input placeholder="Search connections..." className="pl-10 w-64" />
                </div>
                <Button>Find People</Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {connections.map((connection) => (
                <Card key={connection.id}>
                  <CardContent className="p-6 text-center">
                    <Avatar className="w-16 h-16 mx-auto mb-4">
                      <AvatarImage src={connection.avatar || "/placeholder.svg"} />
                      <AvatarFallback>
                        {connection.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="font-semibold mb-1">{connection.name}</h3>
                    <p className="text-sm text-gray-600 mb-1">{connection.title}</p>
                    <p className="text-sm text-gray-500 mb-3">{connection.company}</p>
                    <p className="text-xs text-gray-500 mb-4">{connection.mutualConnections} mutual connections</p>
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1">
                        Message
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                        View Profile
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )

      case "messages":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
              <Button>New Message</Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Message List */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle>Conversations</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="space-y-1">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${message.unread ? "bg-blue-50" : ""}`}
                      >
                        <div className="flex items-start gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={message.avatar || "/placeholder.svg"} />
                            <AvatarFallback>
                              {message.sender
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-sm">{message.sender}</h4>
                              <span className="text-xs text-gray-500">{message.time}</span>
                            </div>
                            <p className="text-sm text-gray-600 truncate">{message.message}</p>
                            {message.unread && <div className="w-2 h-2 bg-blue-600 rounded-full mt-1"></div>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Message Content */}
              <Card className="lg:col-span-2">
                <CardContent className="p-6">
                  <div className="text-center text-gray-500">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Select a conversation to start messaging</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )

      case "settings":
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Account Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" defaultValue={userData.name} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" defaultValue={userData.email} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" defaultValue={userData.phone} />
                  </div>
                  <Button>Save Changes</Button>
                </CardContent>
              </Card>

              {/* Privacy Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Privacy Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Profile Visibility</div>
                      <div className="text-sm text-gray-600">Who can see your profile</div>
                    </div>
                    <Button variant="outline" size="sm">
                      Public
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Email Notifications</div>
                      <div className="text-sm text-gray-600">Receive event updates via email</div>
                    </div>
                    <Button variant="outline" size="sm">
                      Enabled
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Connection Requests</div>
                      <div className="text-sm text-gray-600">Who can send you connection requests</div>
                    </div>
                    <Button variant="outline" size="sm">
                      Everyone
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Password Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Password & Security</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input id="current-password" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input id="new-password" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input id="confirm-password" type="password" />
                  </div>
                  <Button>Update Password</Button>
                </CardContent>
              </Card>

              {/* Notification Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Event Reminders</div>
                      <div className="text-sm text-gray-600">Get notified about upcoming events</div>
                    </div>
                    <Button variant="outline" size="sm">
                      On
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">New Messages</div>
                      <div className="text-sm text-gray-600">Get notified about new messages</div>
                    </div>
                    <Button variant="outline" size="sm">
                      On
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Connection Requests</div>
                      <div className="text-sm text-gray-600">Get notified about new connection requests</div>
                    </div>
                    <Button variant="outline" size="sm">
                      On
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )

      default:
        return <div>Select a section from the sidebar</div>
    }
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar className="border-r">
          <SidebarHeader className="border-b p-4">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={userData.avatar || "/placeholder.svg"} />
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
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <SidebarInset className="flex-1">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
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
          <div className="flex-1 p-6">{renderContent()}</div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
