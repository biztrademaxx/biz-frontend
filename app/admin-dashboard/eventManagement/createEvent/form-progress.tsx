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
      <Progress
        value={completionPercentage}
        className="h-2"
        style={{
          backgroundColor: "#dcfce7",
        }}
      />
      <style jsx global>{`
        /* Target the progress bar indicator */
        [role="progressbar"] > div {
          background-color: #22c55e !important;
        }
        
        /* Alternative selector for shadcn Progress component */
        .relative.h-2.w-full.overflow-hidden.rounded-full.bg-secondary {
          background-color: #dcfce7 !important;
        }
        
        .relative.h-2.w-full.overflow-hidden.rounded-full.bg-secondary > div {
          background-color: #22c55e !important;
        }
      `}</style>
      <p className="text-xs text-muted-foreground mt-1">
        {completionPercentage < 80 ? "Complete required fields to publish your event" : "Ready to publish!"}
      </p>
    </div>
  )
}