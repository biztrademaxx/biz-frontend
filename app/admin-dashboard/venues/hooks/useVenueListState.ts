"use client"

import { useCallback, useEffect, useState } from "react"
import { readAdminListUrl, writeAdminListUrl, parseAdminListPage, listenForAdminListNavigation } from "@/lib/admin-list-url"
import type { VenueTab } from "../types/venue.types"

type VenueListState = {
  activeTab: VenueTab
  searchTerm: string
  statusFilter: string
  listPage: number
}

const tabs: VenueTab[] = ["all", "pending", "active", "bulk-import"]
const statuses = ["all", "active", "pending", "suspended"]

export function useVenueListState(initialTab: VenueTab) {
  const storageKey = `admin:venues:list:${initialTab}`
  const [view, setView] = useState<VenueListState & { storageKey: string | null }>({
    activeTab: initialTab,
    searchTerm: "",
    statusFilter: "all",
    listPage: 1,
    storageKey: null,
  })

  useEffect(() => {
    const restore = () => {
      const restored: VenueListState = {
        activeTab: initialTab,
        searchTerm: "",
        statusFilter: "all",
        listPage: 1,
      }
      try {
        const saved = JSON.parse(sessionStorage.getItem(storageKey) ?? "null")
        if (saved && typeof saved === "object") {
          if (tabs.includes(saved.activeTab)) restored.activeTab = saved.activeTab
          if (typeof saved.searchTerm === "string") restored.searchTerm = saved.searchTerm
          if (statuses.includes(saved.statusFilter)) restored.statusFilter = saved.statusFilter
          restored.listPage = parseAdminListPage(saved.listPage)
        }
      } catch {
        // Keep the list usable when session storage is blocked or malformed.
      }
      const urlState = initialTab === "all" ? readAdminListUrl("venues") : null
      if (urlState) {
        restored.listPage = urlState.page
        restored.searchTerm = urlState.search
        restored.statusFilter = statuses.includes(urlState.status) ? urlState.status : "all"
        restored.activeTab = tabs.includes(urlState.tab as VenueTab) ? urlState.tab as VenueTab : "all"
      }
      setView({ ...restored, storageKey })
    }
    restore()
    if (initialTab === "all") return listenForAdminListNavigation("venues", restore)
  }, [initialTab, storageKey])

  useEffect(() => {
    if (view.storageKey !== storageKey) return
    const { activeTab, searchTerm, statusFilter, listPage } = view
    try {
      sessionStorage.setItem(storageKey, JSON.stringify({ activeTab, searchTerm, statusFilter, listPage }))
    } catch {
      // Storage may be unavailable; pagination still works for this visit.
    }
    if (initialTab === "all") writeAdminListUrl("venues", {
      page: listPage, search: searchTerm, status: statusFilter, tab: activeTab,
    })
  }, [storageKey, view, initialTab])

  const setSearchTerm = useCallback((searchTerm: string) => {
    setView((prev) => prev.searchTerm === searchTerm ? prev : { ...prev, searchTerm, listPage: 1 })
  }, [])
  const setStatusFilter = useCallback((statusFilter: string) => {
    setView((prev) => prev.statusFilter === statusFilter ? prev : { ...prev, statusFilter, listPage: 1 })
  }, [])
  const setActiveTab = useCallback((activeTab: VenueTab) => {
    setView((prev) => prev.activeTab === activeTab ? prev : { ...prev, activeTab, listPage: 1 })
  }, [])
  const setListPage = useCallback((listPage: number) => {
    if (!Number.isSafeInteger(listPage) || listPage < 1) return
    setView((prev) => prev.listPage === listPage ? prev : { ...prev, listPage })
  }, [])

  return {
    ...view,
    restored: view.storageKey === storageKey,
    setSearchTerm,
    setStatusFilter,
    setActiveTab,
    setListPage,
  }
}
