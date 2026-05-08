"use client"

import { Progress } from "@/components/ui/progress"

interface FormProgressProps {
  completionPercentage: number
}

export function FormProgress({ completionPercentage }: FormProgressProps) {
  return (
    <div className="bg-card border rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">Form Completion</span>
        <span className="text-sm text-muted-foreground">{completionPercentage}%</span>
      </div>
      <div style={{ backgroundColor: "#dcfce7", borderRadius: "8px", overflow: "hidden" }}>
        <Progress
          value={completionPercentage}
          className="h-2"
          style={{
            backgroundColor: "transparent",
            '--progress-background': '#22c55e',
          } as React.CSSProperties}
        />
      </div>
      <style jsx>{`
        :global(.progress-indicator) {
          background-color: #22c55e !important;
        }
      `}</style>
      <p className="text-xs text-muted-foreground mt-1">
        {completionPercentage < 80 ? "Complete required fields to publish your event" : "Ready to publish!"}
      </p>
    </div>
  )
}