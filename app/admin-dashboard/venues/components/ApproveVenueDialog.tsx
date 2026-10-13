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
import { ThumbsUp } from "lucide-react"

type ApproveVenueDialogProps = {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  count?: number
  confirming?: boolean
}

export function ApproveVenueDialog({
  isOpen,
  onClose,
  onConfirm,
  count = 1,
  confirming = false,
}: ApproveVenueDialogProps) {
  const many = count > 1
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-green-600">
            <ThumbsUp className="h-5 w-5" />
            {many ? `Approve ${count} venues` : "Approve Venue"}
          </DialogTitle>
          <DialogDescription>
            {many
              ? `Approve ${count} selected venues? They will become active and visible on the public venues page.`
              : "Are you sure you want to approve this venue? This will make it active and visible to users."}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col gap-2 sm:flex-row">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto" disabled={confirming}>
            Cancel
          </Button>
          <Button
            className="w-full bg-green-600 hover:bg-green-700 sm:w-auto"
            onClick={onConfirm}
            disabled={confirming}
          >
            <ThumbsUp className="mr-2 h-4 w-4" />
            {confirming ? "Approving…" : many ? `Approve ${count} venues` : "Approve Venue"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
