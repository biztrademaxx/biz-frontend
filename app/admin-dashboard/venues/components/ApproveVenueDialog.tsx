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
}

export function ApproveVenueDialog({ isOpen, onClose, onConfirm }: ApproveVenueDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-green-600">
            <ThumbsUp className="h-5 w-5" />
            Approve Venue
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to approve this venue? This will make it active and visible to users.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col gap-2 sm:flex-row">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button className="w-full bg-green-600 hover:bg-green-700 sm:w-auto" onClick={onConfirm}>
            <ThumbsUp className="mr-2 h-4 w-4" />
            Approve Venue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
