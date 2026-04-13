// contexts/dashboard-context.tsx
"use client"

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react'

interface DashboardContextType {
  activeSection: string
  setActiveSection: (section: string) => void
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined)

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [activeSection, setActiveSection] = useState("profile")
  
  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    activeSection,
    setActiveSection
  }), [activeSection])

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