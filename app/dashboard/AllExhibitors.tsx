"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import { Search, Filter, Trash2, Building2, Mail, Phone, CalendarDays } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function ExhibitorAppointments() {
  const [date, setDate] = useState<Date | undefined>(new Date())

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-2">
        <h2 className="text-xl font-semibold">Exhibitor Appointments</h2>
        <Button variant="outline" size="sm">Calendar View</Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Requests", value: 4 },
          { label: "Pending", value: 1 },
          { label: "Approved", value: 2 },
          { label: "Completed", value: 1 },
        ].map((stat) => (
          <Card key={stat.label} className="border-2 border-blue-200 hover:border-blue-400">
            <CardContent className="flex flex-col items-center justify-center p-6">
              <span className="text-2xl font-bold">{stat.value}</span>
              <span className="text-sm text-muted-foreground">{stat.label}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-1/2">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search" className="pl-8" />
        </div>
        <Button variant="default" className="flex items-center gap-2">
          <Filter className="h-4 w-4" /> Filter
        </Button>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>{date?.toLocaleString("default", { month: "long", year: "numeric" })}</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border" />
          </CardContent>
        </Card>

        {/* Appointment Card */}
        <Card className="md:col-span-2">
          <CardContent className="flex flex-col gap-4 p-6">
            {/* Header Row */}
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">Rajesh Kumar</h3>
                <div className="flex items-center text-sm text-muted-foreground gap-2">
                  <Building2 className="h-4 w-4" /> Company Name : Mobi tech
                </div>
                <div className="flex items-center text-sm text-muted-foreground gap-2">
                  <Mail className="h-4 w-4" /> ramesh@company.com
                </div>
                <div className="flex items-center text-sm text-muted-foreground gap-2">
                  <Phone className="h-4 w-4" /> +91 99998 88877
                </div>
                <div className="flex items-center text-sm text-muted-foreground gap-2">
                  <CalendarDays className="h-4 w-4" /> March 14, 2025 – 2:00 PM to 6:00 PM
                </div>
              </div>
              <Button variant="ghost" size="icon">
                <Trash2 className="h-5 w-5 text-red-500" />
              </Button>
            </div>

            {/* Tags */}
            <div className="flex gap-2">
              <Badge variant="outline">Conference</Badge>
              <Badge variant="outline">Education</Badge>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button className="bg-green-500 hover:bg-green-600 text-white">Approve</Button>
              <Button variant="secondary">Reschedule</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
