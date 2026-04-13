"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2 } from "lucide-react"

interface Exhibitor {
  id: string
  name: string
  company: string
  email: string
  phone: string
  boothNumber?: string
  eventId: string
  eventTitle: string
}

export default function ExhibitorsEventWise() {
  const [exhibitors, setExhibitors] = useState<Exhibitor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchExhibitors = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/exhibitors/event-wise") // 👈 create this API route
        if (!response.ok) throw new Error("Failed to fetch exhibitors")
        const data = await response.json()
        setExhibitors(data.exhibitors)
      } catch (err) {
        console.error(err)
        setError("Failed to load exhibitors")
      } finally {
        setLoading(false)
      }
    }

    fetchExhibitors()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="ml-2">Loading exhibitors...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-600">
        {error}
      </div>
    )
  }

  if (exhibitors.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-600">
        No exhibitors found.
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Exhibitors (Event Wise)</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Exhibitor Name</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Booth</TableHead>
              <TableHead>Event</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {exhibitors.map((exhibitor) => (
              <TableRow key={exhibitor.id}>
                <TableCell>{exhibitor.name}</TableCell>
                <TableCell>{exhibitor.company}</TableCell>
                <TableCell>{exhibitor.email}</TableCell>
                <TableCell>{exhibitor.phone}</TableCell>
                <TableCell>{exhibitor.boothNumber || "-"}</TableCell>
                <TableCell>{exhibitor.eventTitle}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
