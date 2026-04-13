"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts"

export default function AnalyticsDashboard() {
  const userGrowthData = [
    { month: "Jan", users: 35000, organizers: 650 },
    { month: "Feb", users: 37500, organizers: 680 },
    { month: "Mar", users: 39200, organizers: 720 },
    { month: "Apr", users: 41800, organizers: 750 },
    { month: "May", users: 43500, organizers: 820 },
    { month: "Jun", users: 45231, organizers: 892 },
  ]

  const eventCategoryData = [
    { name: "Exhibitions", value: 45, color: "#3B82F6" },
    { name: "Conferences", value: 30, color: "#10B981" },
    { name: "Workshops", value: 15, color: "#F59E0B" },
    { name: "Seminars", value: 10, color: "#EF4444" },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Platform Analytics</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth */}
        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="users" stackId="1" stroke="#3B82F6" fill="#3B82F6" />
                <Area type="monotone" dataKey="organizers" stackId="1" stroke="#10B981" fill="#10B981" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Event Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Event Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={eventCategoryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${percent ?(percent * 100).toFixed(0) : "0"}%`}
                >
                  {eventCategoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Platform Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={userGrowthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="users" stroke="#3B82F6" strokeWidth={2} />
              <Line type="monotone" dataKey="organizers" stroke="#10B981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
