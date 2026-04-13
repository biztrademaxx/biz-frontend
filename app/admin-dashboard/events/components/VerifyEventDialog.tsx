"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X } from "lucide-react"
import type { Event } from "../types/event.types"

interface VerifyEventDialogProps {
  event: Event | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onVerify: (verify: boolean, customBadge?: File) => void
  loading: boolean
}

export function VerifyEventDialog({ event, open, onOpenChange, onVerify, loading }: VerifyEventDialogProps) {
  const [customBadgeFile, setCustomBadgeFile] = useState<File | null>(null)

  if (!event || !open) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            {event.isVerified ? "Remove Verification" : "Verify Event"}
          </h3>
          <button onClick={() => onOpenChange(false)} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        {!event.isVerified ? (
          <>
            <p className="text-sm text-gray-600 mb-4">
              Verify &quot;{event.title}&quot; and optionally upload a custom badge image.
            </p>
            <div className="space-y-4 mb-6">
              <div>
                <Label htmlFor="badge-upload">Custom Badge (Optional)</Label>
                <Input
                  id="badge-upload"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCustomBadgeFile(e.target.files?.[0] || null)}
                  className="mt-1"
                />
              </div>
            </div>
          </>
        ) : (
          <p className="text-sm text-gray-600 mb-6">
            Are you sure you want to remove verification from &quot;{event.title}&quot;?
          </p>
        )}
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={() => { onOpenChange(false); setCustomBadgeFile(null) }} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant={event.isVerified ? "destructive" : "default"}
            onClick={() => { onVerify(!event.isVerified, customBadgeFile ?? undefined); if (!event.isVerified) setCustomBadgeFile(null) }}
            disabled={loading}
          >
            {loading ? "Processing..." : event.isVerified ? "Remove Verification" : "Verify Event"}
          </Button>
        </div>
      </div>
    </div>
  )
}
