"use client"

import { useState } from "react"
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
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

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

const avatarColors = [
  "bg-emerald-100 text-emerald-700",
  "bg-blue-100 text-blue-700",
  "bg-violet-100 text-violet-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-cyan-100 text-cyan-700",
]

function getAvatarColor(name: string) {
  return avatarColors[name.charCodeAt(0) % avatarColors.length]
}

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
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
  const [editForm, setEditForm] = useState({ name: "", email: "", phone: "", role: "" })

  const defaultUsers: User[] = [
    { id: 1, name: "Ramesh Sharma", email: "ramesh@company.com", phone: "+91 98765 43210", role: "Attendee", status: "Active", joinDate: "2024-01-15", lastLogin: "2024-12-20", events: 12, location: "Mumbai, Maharashtra", totalSpent: 15000, eventsAttended: 8 },
    { id: 2, name: "EventCorp India", email: "contact@eventcorp.in", phone: "+91 87654 32109", role: "Organizer", status: "Active", joinDate: "2023-08-10", lastLogin: "2024-12-22", events: 45, location: "Delhi, India", totalSpent: 125000, eventsAttended: 0 },
    { id: 3, name: "Priya Patel", email: "priya@techsolutions.com", phone: "+91 76543 21098", role: "Attendee", status: "Suspended", joinDate: "2024-03-22", lastLogin: "2024-12-18", events: 8, location: "Bangalore, Karnataka", totalSpent: 8500, eventsAttended: 5 },
    { id: 4, name: "Tech Events Ltd", email: "info@techevents.com", phone: "+91 65432 10987", role: "Organizer", status: "Active", joinDate: "2023-11-05", lastLogin: "2024-12-21", events: 28, location: "Pune, Maharashtra", totalSpent: 89000, eventsAttended: 0 },
    { id: 5, name: "Anjali Singh", email: "anjali@gmail.com", phone: "+91 54321 09876", role: "Attendee", status: "Active", joinDate: "2024-02-14", lastLogin: "2024-12-19", events: 6, location: "Chennai, Tamil Nadu", totalSpent: 4200, eventsAttended: 4 },
  ]

  const [usersData, setUsersData] = useState(users || defaultUsers)

  const getFilteredUsersByTab = (tab: string) => {
    const searchFiltered = usersData.filter(
      (user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    switch (tab) {
      case "attendees": return searchFiltered.filter((u) => u.role === "Attendee")
      case "organizers": return searchFiltered.filter((u) => u.role === "Organizer")
      case "suspended": return searchFiltered.filter((u) => u.status === "Suspended")
      default: return searchFiltered
    }
  }

  const handleViewUser = (user: User) => { setSelectedUser(user); setShowViewDialog(true) }
  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setEditForm({ name: user.name, email: user.email, phone: user.phone || "", role: user.role })
    setShowEditDialog(true)
  }
  const handleSaveEdit = () => {
    if (selectedUser) {
      setUsersData(usersData.map((u) => u.id === selectedUser.id ? { ...u, ...editForm } : u))
      setShowEditDialog(false); setSelectedUser(null)
    }
  }
  const handleSuspendUser = (user: User) => { setSelectedUser(user); setShowSuspendDialog(true) }
  const handleConfirmSuspend = () => {
    if (selectedUser) {
      setUsersData(usersData.map((u) => u.id === selectedUser.id ? { ...u, status: "Suspended" } : u))
      setShowSuspendDialog(false); setSelectedUser(null); setSuspendReason("")
    }
  }
  const handleActivateUser = (user: User) => { setSelectedUser(user); setShowActivateDialog(true) }
  const handleConfirmActivate = () => {
    if (selectedUser) {
      setUsersData(usersData.map((u) => u.id === selectedUser.id ? { ...u, status: "Active" } : u))
      setShowActivateDialog(false); setSelectedUser(null)
    }
  }
  const handleExportData = () => {
    const csvContent = [
      ["Name", "Email", "Role", "Status", "Join Date", "Last Login", "Events"],
      ...usersData.map((u) => [u.name, u.email, u.role, u.status, u.joinDate, u.lastLogin, u.events.toString()]),
    ].map((row) => row.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a"); a.href = url; a.download = "users_data.csv"; a.click()
    window.URL.revokeObjectURL(url)
  }

  const statCards = [
    { label: "TOTAL USERS", value: usersData.length, sub: "All registered users", subColor: "text-gray-400" },
    { label: "ACTIVE (30D)", value: usersData.filter((u) => u.status === "Active").length, sub: `${Math.round((usersData.filter((u) => u.status === "Active").length / Math.max(usersData.length, 1)) * 100)}% active rate`, subColor: "text-emerald-600" },
    { label: "NEW THIS MONTH", value: usersData.filter((u) => u.role === "Organizer").length, sub: "+8% vs last month", subColor: "text-emerald-600" },
    { label: "BANNED", value: usersData.filter((u) => u.status === "Suspended").length, sub: `${((usersData.filter((u) => u.status === "Suspended").length / Math.max(usersData.length, 1)) * 100).toFixed(2)}% rate`, subColor: "text-gray-400" },
  ]

  const UserTable = ({ users }: { users: User[] }) => (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="w-10 px-5 py-3">
              <input type="checkbox" className="rounded border-gray-300" />
            </th>
            <th className="text-left px-4 py-3 text-[10px] font-semibold tracking-[0.12em] uppercase text-gray-400">User</th>
            <th className="text-left px-4 py-3 text-[10px] font-semibold tracking-[0.12em] uppercase text-gray-400">Role</th>
            <th className="text-left px-4 py-3 text-[10px] font-semibold tracking-[0.12em] uppercase text-gray-400">Events Attended</th>
            <th className="text-left px-4 py-3 text-[10px] font-semibold tracking-[0.12em] uppercase text-gray-400">Status</th>
            <th className="text-left px-4 py-3 text-[10px] font-semibold tracking-[0.12em] uppercase text-gray-400">Joined</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {users.map((user) => {
            const initials = getInitials(user.name)
            const colorClass = getAvatarColor(user.name)
            return (
              <tr key={user.id} className="hover:bg-gray-50/60 transition-colors">
                <td className="px-5 py-4">
                  <input type="checkbox" className="rounded border-gray-300" />
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${colorClass}`}>
                      {initials}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-400">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role === "Organizer" ? "bg-violet-100 text-violet-700" : "bg-blue-100 text-blue-700"
                    }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-4 text-sm text-gray-700 font-medium" style={{ fontFamily: "'DM Mono', monospace" }}>
                  {user.events}
                </td>
                <td className="px-4 py-4">
                  {user.status === "Active" ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />
                      Suspended
                    </span>
                  )}
                </td>
                <td className="px-4 py-4 text-sm text-gray-500">
                  {new Date(user.joinDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleViewUser(user)}
                      className="text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      View
                    </button>
                    <button
                      onClick={() => user.status === "Active" ? handleSuspendUser(user) : handleActivateUser(user)}
                      className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${user.status === "Active"
                          ? "border-red-200 text-red-600 hover:bg-red-50"
                          : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                        }`}
                    >
                      {user.status === "Active" ? "Ban" : "Activate"}
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
          {users.length === 0 && (
            <tr>
              <td colSpan={7} className="text-center py-16 text-sm text-gray-400">No users found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )

  return (
    <div className="min-h-screen p-8" style={{ background: "#F5F4F0", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');`}</style>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs font-medium tracking-[0.15em] uppercase text-gray-400 mb-1">Admin Panel</p>
          <h1 className="text-2xl font-semibold text-gray-900">User Management</h1>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              placeholder="Search users…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 w-56"
            />
          </div>
          <button
            onClick={handleExportData}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {statCards.map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-5 border border-gray-100">
            <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-gray-400 mb-2">{s.label}</p>
            <p className="text-3xl font-semibold text-gray-900" style={{ fontFamily: "'DM Mono', monospace" }}>{s.value}</p>
            <p className={`text-xs mt-1 font-medium ${s.subColor}`}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white border border-gray-200 rounded-lg p-1 gap-1 mb-4">
          {[
            { value: "all", label: `All Users (${usersData.length})` },
            { value: "attendees", label: `Attendees (${usersData.filter((u) => u.role === "Attendee").length})` },
            { value: "organizers", label: `Organizers (${usersData.filter((u) => u.role === "Organizer").length})` },
            { value: "suspended", label: `Suspended (${usersData.filter((u) => u.status === "Suspended").length})` },
          ].map((t) => (
            <TabsTrigger
              key={t.value}
              value={t.value}
              className="text-sm px-4 py-1.5 rounded-md data-[state=active]:bg-gray-900 data-[state=active]:text-white text-gray-500"
            >
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all"><UserTable users={getFilteredUsersByTab("all")} /></TabsContent>
        <TabsContent value="attendees"><UserTable users={getFilteredUsersByTab("attendees")} /></TabsContent>
        <TabsContent value="organizers"><UserTable users={getFilteredUsersByTab("organizers")} /></TabsContent>
        <TabsContent value="suspended"><UserTable users={getFilteredUsersByTab("suspended")} /></TabsContent>
      </Tabs>

      {/* View Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>Complete information about the selected user</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-semibold ${getAvatarColor(selectedUser.name)}`}>
                  {getInitials(selectedUser.name)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{selectedUser.name}</h3>
                  <p className="text-sm text-gray-500">{selectedUser.email}</p>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${selectedUser.role === "Organizer" ? "bg-violet-100 text-violet-700" : "bg-blue-100 text-blue-700"
                    }`}>{selectedUser.role}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-600"><Phone className="w-4 h-4 text-gray-400" />{selectedUser.phone || "Not provided"}</div>
                  <div className="flex items-center gap-2 text-gray-600"><MapPin className="w-4 h-4 text-gray-400" />{selectedUser.location || "Not provided"}</div>
                  <div className="flex items-center gap-2 text-gray-600"><Calendar className="w-4 h-4 text-gray-400" />Joined: {selectedUser.joinDate}</div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-600"><Activity className="w-4 h-4 text-gray-400" />Last login: {selectedUser.lastLogin}</div>
                  <div className="flex items-center gap-2 text-gray-600"><Calendar className="w-4 h-4 text-gray-400" />Total events: {selectedUser.events}</div>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-3">Statistics</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="text-gray-600">Events {selectedUser.role === "Organizer" ? "Organized" : "Attended"}: <span className="font-medium text-gray-900">{selectedUser.eventsAttended ?? selectedUser.events}</span></div>
                  <div className="text-gray-600">Total {selectedUser.role === "Organizer" ? "Revenue" : "Spent"}: <span className="font-medium text-gray-900">₹{selectedUser.totalSpent?.toLocaleString()}</span></div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowViewDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {[
              { id: "name", label: "Name", type: "text", key: "name" },
              { id: "email", label: "Email", type: "email", key: "email" },
              { id: "phone", label: "Phone", type: "text", key: "phone" },
            ].map((f) => (
              <div key={f.id}>
                <Label htmlFor={f.id} className="text-xs font-semibold tracking-widest uppercase text-gray-400">{f.label}</Label>
                <Input
                  id={f.id}
                  type={f.type}
                  value={(editForm as any)[f.key]}
                  onChange={(e) => setEditForm({ ...editForm, [f.key]: e.target.value })}
                  className="mt-1"
                />
              </div>
            ))}
            <div>
              <Label htmlFor="role" className="text-xs font-semibold tracking-widest uppercase text-gray-400">Role</Label>
              <select
                id="role"
                value={editForm.role}
                onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                className="w-full mt-1 p-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10"
              >
                <option value="Attendee">Attendee</option>
                <option value="Organizer">Organizer</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Suspend Dialog */}
      <Dialog open={showSuspendDialog} onOpenChange={setShowSuspendDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" /> Suspend User
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to suspend {selectedUser?.name}? This will restrict their platform access.
            </DialogDescription>
          </DialogHeader>
          <div>
            <Label htmlFor="reason" className="text-xs font-semibold tracking-widest uppercase text-gray-400">Reason (required)</Label>
            <Textarea
              id="reason"
              className="mt-1"
              placeholder="Please provide a reason…"
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSuspendDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleConfirmSuspend} disabled={!suspendReason.trim()}>Suspend User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Activate Dialog */}
      <Dialog open={showActivateDialog} onOpenChange={setShowActivateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-emerald-600">
              <CheckCircle className="w-5 h-5" /> Activate User
            </DialogTitle>
            <DialogDescription>
              Restore full platform access for {selectedUser?.name}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowActivateDialog(false)}>Cancel</Button>
            <Button onClick={handleConfirmActivate}>Activate User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}