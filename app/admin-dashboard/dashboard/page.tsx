"use client"

import DashboardOverview from "../dashboard-overview"

interface DashboardPageProps {
  onNavigate?: (sectionId: string) => void
}

export default function DashboardPage({ onNavigate }: DashboardPageProps) {
  return <DashboardOverview onNavigate={onNavigate} />
}
