"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  UserX,
  UserCheck,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Activity,
  AlertTriangle,
} from "lucide-react"

interface User {
  id: number
  name: string
  email: string
  phone?: string
  role: string
  status: string
  joinDate: string
  lastLogin: string
  events: number
  avatar?: string
  location?: string
  totalSpent?: number
  eventsAttended?: number
}

interface UserManagementProps {
  users?: User[]
}

export default function UserManagement({ users }: UserManagementProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showSuspendDialog, setShowSuspendDialog] = useState(false)
  const [showActivateDialog, setShowActivateDialog] = useState(false)
  const [suspendReason, setSuspendReason] = useState("")
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
  })

  const defaultUsers: User[] = [
    {
      id: 1,
      name: "Ramesh Sharma",
      email: "ramesh@company.com",
      phone: "+91 98765 43210",
      role: "Attendee",
      status: "Active",
      joinDate: "2024-01-15",
      lastLogin: "2024-12-20",
      events: 12,
      location: "Mumbai, Maharashtra",
      totalSpent: 15000,
      eventsAttended: 8,
      avatar: "/placeholder.svg?height=40&width=40&text=RS",
    },
    {
      id: 2,
      name: "EventCorp India",
      email: "contact@eventcorp.in",
      phone: "+91 87654 32109",
      role: "Organizer",
      status: "Active",
      joinDate: "2023-08-10",
      lastLogin: "2024-12-22",
      events: 45,
      location: "Delhi, India",
      totalSpent: 125000,
      eventsAttended: 0,
      avatar: "/placeholder.svg?height=40&width=40&text=EC",
    },
    {
      id: 3,
      name: "Priya Patel",
      email: "priya@techsolutions.com",
      phone: "+91 76543 21098",
      role: "Attendee",
      status: "Suspended",
      joinDate: "2024-03-22",
      lastLogin: "2024-12-18",
      events: 8,
      location: "Bangalore, Karnataka",
      totalSpent: 8500,
      eventsAttended: 5,
      avatar: "/placeholder.svg?height=40&width=40&text=PP",
    },
    {
      id: 4,
      name: "Tech Events Ltd",
      email: "info@techevents.com",
      phone: "+91 65432 10987",
      role: "Organizer",
      status: "Active",
      joinDate: "2023-11-05",
      lastLogin: "2024-12-21",
      events: 28,
      location: "Pune, Maharashtra",
      totalSpent: 89000,
      eventsAttended: 0,
      avatar: "/placeholder.svg?height=40&width=40&text=TE",
    },
    {
      id: 5,
      name: "Anjali Singh",
      email: "anjali@gmail.com",
      phone: "+91 54321 09876",
      role: "Attendee",
      status: "Active",
      joinDate: "2024-02-14",
      lastLogin: "2024-12-19",
      events: 6,
      location: "Chennai, Tamil Nadu",
      totalSpent: 4200,
      eventsAttended: 4,
      avatar: "/placeholder.svg?height=40&width=40&text=AS",
    },
  ]

  const [usersData, setUsersData] = useState(users || defaultUsers)

  // Filter users based on active tab
  const getFilteredUsersByTab = (tab: string) => {
    const searchFiltered = usersData.filter(
      (user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    switch (tab) {
      case "attendees":
        return searchFiltered.filter((user) => user.role === "Attendee")
      case "organizers":
        return searchFiltered.filter((user) => user.role === "Organizer")
      case "suspended":
        return searchFiltered.filter((user) => user.status === "Suspended")
      default:
        return searchFiltered
    }
  }

  // Handle view user
  const handleViewUser = (user: User) => {
    setSelectedUser(user)
    setShowViewDialog(true)
  }

  // Handle edit user
  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setEditForm({
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      role: user.role,
    })
    setShowEditDialog(true)
  }

  // Handle save edit
  const handleSaveEdit = () => {
    if (selectedUser) {
      setUsersData(
        usersData.map((user) =>
          user.id === selectedUser.id
            ? {
                ...user,
                name: editForm.name,
                email: editForm.email,
                phone: editForm.phone,
                role: editForm.role,
              }
            : user,
        ),
      )
      setShowEditDialog(false)
      setSelectedUser(null)
    }
  }

  // Handle suspend user
  const handleSuspendUser = (user: User) => {
    setSelectedUser(user)
    setShowSuspendDialog(true)
  }

  // Handle confirm suspend
  const handleConfirmSuspend = () => {
    if (selectedUser) {
      setUsersData(usersData.map((user) => (user.id === selectedUser.id ? { ...user, status: "Suspended" } : user)))
      setShowSuspendDialog(false)
      setSelectedUser(null)
      setSuspendReason("")
    }
  }

  // Handle activate user
  const handleActivateUser = (user: User) => {
    setSelectedUser(user)
    setShowActivateDialog(true)
  }

  // Handle confirm activate
  const handleConfirmActivate = () => {
    if (selectedUser) {
      setUsersData(usersData.map((user) => (user.id === selectedUser.id ? { ...user, status: "Active" } : user)))
      setShowActivateDialog(false)
      setSelectedUser(null)
    }
  }

  // Handle export data
  const handleExportData = () => {
    const csvContent = [
      ["Name", "Email", "Role", "Status", "Join Date", "Last Login", "Events"],
      ...usersData.map((user) => [
        user.name,
        user.email,
        user.role,
        user.status,
        user.joinDate,
        user.lastLogin,
        user.events.toString(),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "users_data.csv"
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const UserTable = ({ users }: { users: User[] }) => (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4 font-medium">User</th>
                <th className="text-left p-4 font-medium">Role</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-left p-4 font-medium">Join Date</th>
                <th className="text-left p-4 font-medium">Last Login</th>
                <th className="text-left p-4 font-medium">Events</th>
                <th className="text-left p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={user.avatar || "/placeholder.svg"} />
                        <AvatarFallback>
                          {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-gray-600">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge variant={user.role === "Organizer" ? "default" : "secondary"}>{user.role}</Badge>
                  </td>
                  <td className="p-4">
                    <Badge
                      variant={user.status === "Active" ? "default" : "destructive"}
                      className="flex items-center gap-1 w-fit"
                    >
                      {user.status === "Active" ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {user.status}
                    </Badge>
                  </td>
                  <td className="p-4 text-sm">{user.joinDate}</td>
                  <td className="p-4 text-sm">{user.lastLogin}</td>
                  <td className="p-4 text-sm">{user.events}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleViewUser(user)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleEditUser(user)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => (user.status === "Active" ? handleSuspendUser(user) : handleActivateUser(user))}
                      >
                        {user.status === "Active" ? (
                          <UserX className="w-4 h-4 text-red-500" />
                        ) : (
                          <UserCheck className="w-4 h-4 text-green-500" />
                        )}
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewUser(user)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditUser(user)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit User
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Mail className="w-4 h-4 mr-2" />
                            Send Message
                          </DropdownMenuItem>
                          {user.status === "Active" ? (
                            <DropdownMenuItem onClick={() => handleSuspendUser(user)} className="text-red-600">
                              <UserX className="w-4 h-4 mr-2" />
                              Suspend User
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => handleActivateUser(user)} className="text-green-600">
                              <UserCheck className="w-4 h-4 mr-2" />
                              Activate User
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search users..."
              className="pl-10 w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" className="flex items-center gap-2 bg-transparent">
            <Filter className="w-4 h-4" />
            Filter
          </Button>
          <Button variant="outline" className="flex items-center gap-2 bg-transparent" onClick={handleExportData}>
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold">{usersData.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold">{usersData.filter((user) => user.status === "Active").length}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Organizers</p>
                <p className="text-2xl font-bold">{usersData.filter((user) => user.role === "Organizer").length}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Suspended</p>
                <p className="text-2xl font-bold">{usersData.filter((user) => user.status === "Suspended").length}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Users ({usersData.length})</TabsTrigger>
          <TabsTrigger value="attendees">
            Attendees ({usersData.filter((user) => user.role === "Attendee").length})
          </TabsTrigger>
          <TabsTrigger value="organizers">
            Organizers ({usersData.filter((user) => user.role === "Organizer").length})
          </TabsTrigger>
          <TabsTrigger value="suspended">
            Suspended ({usersData.filter((user) => user.status === "Suspended").length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <UserTable users={getFilteredUsersByTab("all")} />
        </TabsContent>

        <TabsContent value="attendees">
          <UserTable users={getFilteredUsersByTab("attendees")} />
        </TabsContent>

        <TabsContent value="organizers">
          <UserTable users={getFilteredUsersByTab("organizers")} />
        </TabsContent>

        <TabsContent value="suspended">
          <UserTable users={getFilteredUsersByTab("suspended")} />
        </TabsContent>
      </Tabs>

      {/* View User Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>Complete information about the selected user</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={selectedUser.avatar || "/placeholder.svg"} />
                  <AvatarFallback>
                    {selectedUser.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{selectedUser.name}</h3>
                  <p className="text-gray-600">{selectedUser.email}</p>
                  <Badge variant={selectedUser.role === "Organizer" ? "default" : "secondary"}>
                    {selectedUser.role}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">{selectedUser.phone || "Not provided"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">{selectedUser.location || "Not provided"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">Joined: {selectedUser.joinDate}</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">Last Login: {selectedUser.lastLogin}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">Total Events: {selectedUser.events}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">
                      Status:{" "}
                      <Badge variant={selectedUser.status === "Active" ? "default" : "destructive"}>
                        {selectedUser.status}
                      </Badge>
                    </span>
                  </div>
                </div>
              </div>

              {selectedUser.role === "Attendee" && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Attendee Statistics</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>Events Attended: {selectedUser.eventsAttended}</div>
                    <div>Total Spent: ₹{selectedUser.totalSpent?.toLocaleString()}</div>
                  </div>
                </div>
              )}

              {selectedUser.role === "Organizer" && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Organizer Statistics</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>Events Organized: {selectedUser.events}</div>
                    <div>Total Revenue: ₹{selectedUser.totalSpent?.toLocaleString()}</div>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowViewDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <select
                id="role"
                value={editForm.role}
                onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                className="w-full p-2 border rounded-md"
              >
                <option value="Attendee">Attendee</option>
                <option value="Organizer">Organizer</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Suspend User Dialog */}
      <Dialog open={showSuspendDialog} onOpenChange={setShowSuspendDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Suspend User
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to suspend {selectedUser?.name}? This action will restrict their access to the
              platform.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reason">Reason for suspension (required)</Label>
              <Textarea
                id="reason"
                placeholder="Please provide a reason for suspending this user..."
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSuspendDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmSuspend} disabled={!suspendReason.trim()}>
              Suspend User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Activate User Dialog */}
      <Dialog open={showActivateDialog} onOpenChange={setShowActivateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              Activate User
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to activate {selectedUser?.name}? This will restore their full access to the
              platform.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowActivateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmActivate}>Activate User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
