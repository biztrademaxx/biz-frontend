"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Download, DollarSign, TrendingUp, BarChart3 } from "lucide-react"

interface RevenueData {
  revenueData: Array<{ month: string; revenue: number }>
  totalRevenue: string
  monthlyRevenue: string
  averagePerEvent: string
}

interface RevenueManagementProps {
  revenueData: RevenueData
}

export default function RevenueManagement({ revenueData }: RevenueManagementProps) {
  const { revenueData: chartData, totalRevenue, monthlyRevenue, averagePerEvent } = revenueData

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Revenue</h1>
        <Button variant="outline" className="flex items-center gap-2 bg-transparent">
          <Download className="w-4 h-4" />
          Export Report
        </Button>
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold">{totalRevenue}</p>
                <p className="text-sm text-green-600">+25% from last month</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold">{monthlyRevenue}</p>
                <p className="text-sm text-green-600">+15% from last month</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average per Event</p>
                <p className="text-2xl font-bold">{averagePerEvent}</p>
                <p className="text-sm text-green-600">+8% from last quarter</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Revenue Trends</h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [`₹${(Number(value) / 1000).toFixed(0)}K`, "Revenue"]} />
              <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
