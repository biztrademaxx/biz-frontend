"use client"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ThumbsUp } from "lucide-react"
import type { useVenueManagement } from "../hooks/useVenueManagement"

type VenueBulkActionsProps = {
  selection: ReturnType<typeof useVenueManagement>["bulkSelection"]
}

export function VenueBulkActions({ selection }: VenueBulkActionsProps) {
  const count = selection.selectedIds.size
  const pageChecked = selection.pageCount > 0 && selection.pageSelectedCount === selection.pageCount

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-muted/30 p-3">
      <label className="flex items-center gap-2 text-sm font-medium">
        <Checkbox
          checked={pageChecked ? true : selection.pageSelectedCount > 0 ? "indeterminate" : false}
          disabled={selection.pageCount === 0 || selection.approving}
          onCheckedChange={(checked) => selection.togglePage(checked === true)}
        />
        Select all on this page
      </label>
      <span className="text-sm text-muted-foreground" aria-live="polite">
        {count} selected across all pages
      </span>
      {selection.totalCount > count ? (
        <Button type="button" variant="outline" size="sm" disabled={selection.approving} onClick={selection.selectAll}>
          Select all {selection.totalCount} matching venues
        </Button>
      ) : null}
      {count > 0 ? (
        <Button type="button" variant="ghost" size="sm" disabled={selection.approving} onClick={selection.clear}>
          Clear selection
        </Button>
      ) : null}
      <Button
        type="button"
        size="sm"
        className="bg-emerald-600 hover:bg-emerald-700 sm:ml-auto"
        disabled={count === 0 || selection.approving}
        onClick={selection.openApproval}
      >
        <ThumbsUp className="mr-2 h-4 w-4" />
        {selection.approving ? "Approving..." : count > 0 && count === selection.totalCount ? `Approve all (${count})` : `Approve selected (${count})`}
      </Button>
    </div>
  )
}
