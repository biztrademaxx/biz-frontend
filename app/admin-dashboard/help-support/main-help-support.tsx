// components/help-support/main-help-support.tsx
"use client"

import { useState } from "react"
import SupportTickets from "./support-tickets"
import SupportContacts from "./support-contacts"
import SupportNotes from "./support-notes"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function MainHelpSupport() {
  const [activeTab, setActiveTab] = useState("tickets")

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Help & Support</h1>
          <p className="text-muted-foreground">
            Manage support tickets, contacts, and internal notes
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tickets">Support Tickets</TabsTrigger>
          <TabsTrigger value="contacts">Support Contacts</TabsTrigger>
          <TabsTrigger value="notes">Support Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="tickets" className="space-y-4">
          <SupportTickets />
        </TabsContent>

        <TabsContent value="contacts" className="space-y-4">
          <SupportContacts />
        </TabsContent>

        <TabsContent value="notes" className="space-y-4">
          <SupportNotes />
        </TabsContent>
      </Tabs>
    </div>
  )
}