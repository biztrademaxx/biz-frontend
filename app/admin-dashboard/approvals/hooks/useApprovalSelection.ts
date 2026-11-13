"use client"

import { useEffect, useRef, useState } from "react"

export function useApprovalSelection(scope: string) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [selecting, setSelecting] = useState(false)
  const requestId = useRef(0)

  useEffect(() => {
    requestId.current += 1
    setSelectedIds(new Set())
    setSelecting(false)
    return () => { requestId.current += 1 }
  }, [scope])

  const selectAll = async (loadIds: () => Promise<string[]>): Promise<string[]> => {
    const currentRequest = ++requestId.current
    setSelecting(true)
    try {
      const ids = [...new Set((await loadIds()).filter(Boolean))]
      if (currentRequest !== requestId.current) return []
      setSelectedIds(new Set(ids))
      return ids
    } finally {
      if (currentRequest === requestId.current) setSelecting(false)
    }
  }

  return { selectedIds, setSelectedIds, selecting, selectAll }
}
