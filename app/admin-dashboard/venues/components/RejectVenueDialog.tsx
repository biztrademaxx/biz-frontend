"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ThumbsDown } from "lucide-react"
import { useState, type FormEvent } from "react"

type RejectVenueDialogProps = {
  isOpen: boolean
  onClose: () => void
  onReject: (reason: string) => void
  venueName?: string
}

export function RejectVenueDialog({ isOpen, onClose, onReject, venueName }: RejectVenueDialogProps) {
  const [reason, setReason] = useState("")

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (reason.trim()) {
      onReject(reason)
      setReason("")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <ThumbsDown className="h-5 w-5" />
            Reject Venue
          </DialogTitle>
          <DialogDescription>
            {venueName
              ? `Are you sure you want to reject "${venueName}"?`
              : "Are you sure you want to reject this venue?"}{" "}
            Please provide a reason for rejection.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rejection-reason">Reason for Rejection</Label>
              <Textarea
                id="rejection-reason"
                placeholder="Please provide the reason for rejecting this venue..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                required
              />
            </div>
          </div>
          <DialogFooter className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 sm:w-auto"
              disabled={!reason.trim()}
            >
              <ThumbsDown className="mr-2 h-4 w-4" />
              Reject Venue
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
