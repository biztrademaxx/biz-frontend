"use client"

import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function SupportPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-10">

      <div className="text-center space-y-3">
        <h1 className="text-3xl font-bold">Support Center</h1>
        <p className="text-muted-foreground">
          How Can We Help You Today?
        </p>
      </div>

      {/* Search */}
      <Input placeholder="Search for help, topics, or questions…" />

      {/* Categories */}
      <div className="grid md:grid-cols-2 gap-6">

        <Card>
          <CardHeader><CardTitle>📢 Event Organizers</CardTitle></CardHeader>
          <CardContent>
            <p>• Register as organizer</p>
            <p>• List & manage events</p>
            <p>• Promotion & leads</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>🏢 Exhibitors</CardTitle></CardHeader>
          <CardContent>
            <p>• Find events</p>
            <p>• Contact organizers</p>
            <p>• Promote brand</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>🎯 Visitors</CardTitle></CardHeader>
          <CardContent>
            <p>• Search events</p>
            <p>• Filters & categories</p>
            <p>• Registration</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>⚙️ Technical Support</CardTitle></CardHeader>
          <CardContent>
            <p>• Login issues</p>
            <p>• Password reset</p>
            <p>• Profile management</p>
          </CardContent>
        </Card>

      </div>

      {/* Contact */}
      <div className="text-center">
        <p>Email: support@biztradefairs.com</p>
        <p>Mon–Sat | 10AM–6PM</p>
      </div>

    </div>
  )
}