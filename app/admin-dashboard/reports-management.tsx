"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Calendar, DollarSign } from "lucide-react"

export default function ReportsManagement() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Reports</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold">User Report</h3>
                <p className="text-sm text-gray-600">User activity and engagement</p>
              </div>
            </div>
            <Button variant="outline" className="w-full bg-transparent">
              Generate Report
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-green-100 rounded-full">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold">Event Report</h3>
                <p className="text-sm text-gray-600">Event performance metrics</p>
              </div>
            </div>
            <Button variant="outline" className="w-full bg-transparent">
              Generate Report
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-yellow-100 rounded-full">
                <DollarSign className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-semibold">Financial Report</h3>
                <p className="text-sm text-gray-600">Revenue and commission data</p>
              </div>
            </div>
            <Button variant="outline" className="w-full bg-transparent">
              Generate Report
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
