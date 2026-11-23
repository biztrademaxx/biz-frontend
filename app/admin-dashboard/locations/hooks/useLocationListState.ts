"use client"

import { useCallback, useEffect, useState } from "react"
import { listenForAdminListNavigation, parseAdminListPage, readAdminListUrl, writeAdminListUrl } from "@/lib/admin-list-url"

export type LocationTab = "countries" | "states" | "cities"

type LocationListState = {
  page: number
  search: string
  country: string
  storageKey: string | null
}

export function useLocationListState(tab: LocationTab) {
  const storageKey = "admin:locations:" + tab + ":list"
  const [view, setView] = useState<LocationListState>({ page: 1, search: "", country: "", storageKey: null })

  useEffect(() => {
    const restore = () => {
      let saved = { page: 1, search: "", country: "" }
      try {
        saved = { ...saved, ...JSON.parse(sessionStorage.getItem(storageKey) || "{}") }
      } catch {
        /* ignore malformed/blocked storage */
      }
      const state = readAdminListUrl("locations", tab) ?? saved
      setView({
        page: parseAdminListPage(state.page),
        search: typeof state.search === "string" ? state.search : "",
        country: typeof state.country === "string" && state.country !== "all" ? state.country.toUpperCase() : "",
        storageKey,
      })
    }
    restore()
    return listenForAdminListNavigation("locations", restore, tab)
  }, [storageKey, tab])

  useEffect(() => {
    if (view.storageKey !== storageKey || tab === "cities") return
    const { page, search, country } = view
    try {
      sessionStorage.setItem(storageKey, JSON.stringify({ page, search, country }))
    } catch {
      /* ignore blocked/full storage */
    }
    writeAdminListUrl("locations", { page, search, country: tab === "states" ? country : "all" }, tab)
  }, [view, storageKey, tab])

  const setPage = useCallback((page: number) => {
    if (!Number.isSafeInteger(page) || page < 1) return
    setView((previous) => previous.page === page ? previous : { ...previous, page })
  }, [])
  const setSearchTerm = useCallback((search: string) => {
    setView((previous) => previous.search === search ? previous : { ...previous, search, page: 1 })
  }, [])
  const setSelectedStateCountry = useCallback((country: string) => {
    setView((previous) => previous.country === country ? previous : { ...previous, country, page: 1 })
  }, [])

  return {
    page: view.page,
    searchTerm: view.search,
    selectedStateCountry: view.country,
    restored: view.storageKey === storageKey,
    setPage,
    setSearchTerm,
    setSelectedStateCountry,
  }
}
