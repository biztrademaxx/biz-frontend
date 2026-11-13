"use client"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { CheckCheck, Loader2 } from "lucide-react"

type ApprovalBulkActionsProps = {
  entity: string
  totalCount: number
  selectedCount: number
  onSelectAll: (checked: boolean) => void
  onApproveSelected: () => void
  onApproveAll: () => void
  disabled?: boolean
  selecting?: boolean
  approving?: boolean
}

export function ApprovalBulkActions({
  entity, totalCount, selectedCount, onSelectAll, onApproveSelected, onApproveAll,
  disabled = false, selecting = false, approving = false,
}: ApprovalBulkActionsProps) {
  const busy = disabled || selecting || approving
  const allSelected = totalCount > 0 && selectedCount === totalCount
  return (
    <div className="mb-3 flex flex-col gap-3 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <label className="flex items-center gap-2 text-sm font-medium">
          <Checkbox
            aria-label={`Select all pending ${entity}`}
            checked={allSelected ? true : selectedCount > 0 ? "indeterminate" : false}
            onCheckedChange={(value) => onSelectAll(value === true)}
            disabled={busy || totalCount === 0}
          />
          Select all ({totalCount})
        </label>
        <p className="text-xs text-muted-foreground" role="status">
          {selecting ? "Selecting all pending items..." : `${selectedCount} selected across all pages`}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" disabled={busy || selectedCount === 0} onClick={onApproveSelected}>
          Approve selected{selectedCount > 0 ? ` (${selectedCount})` : ""}
        </Button>
        <Button size="sm" className="bg-green-600 text-white hover:bg-green-700"
          disabled={busy || totalCount === 0} onClick={onApproveAll}>
          {selecting || approving ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <CheckCheck className="mr-1.5 h-4 w-4" />}
          {approving ? "Approving..." : `Approve all ${entity} (${totalCount})`}
        </Button>
      </div>
    </div>
  )
}
