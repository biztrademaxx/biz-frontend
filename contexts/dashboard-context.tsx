// contexts/dashboard-context.tsx
"use client"

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react'

interface DashboardContextType {
  activeSection: string
  setActiveSection: (section: string) => void
  messageTargetUserId: string | null
  openMessagesWithUser: (userId: string) => void
  clearMessageTarget: () => void
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined)

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  // Change this from "profile" to "dashboard"
  const [activeSection, setActiveSection] = useState("overview")
  const [messageTargetUserId, setMessageTargetUserId] = useState<string | null>(null)

  const openMessagesWithUser = useCallback((userId: string) => {
    setMessageTargetUserId(userId)
  }, [])

  const clearMessageTarget = useCallback(() => {
    setMessageTargetUserId(null)
  }, [])

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    activeSection,
    setActiveSection,
    messageTargetUserId,
    openMessagesWithUser,
    clearMessageTarget,
  }), [activeSection, messageTargetUserId, openMessagesWithUser, clearMessageTarget])

  return (
    <DashboardContext.Provider value={contextValue}>
      {children}
    </DashboardContext.Provider>
  )
}

export function useDashboard() {
  const context = useContext(DashboardContext)
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider')
  }
  return context
}