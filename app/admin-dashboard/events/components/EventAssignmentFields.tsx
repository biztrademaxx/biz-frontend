"use client"

import { useEffect, useId, useState, type Ref } from "react"
import { useFormContext } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { adminApi } from "@/lib/admin-api"
import type { EditEventFormValues, EditEventRecord } from "../edit-event-schema"
import { getAssignmentDetails, getAssignmentName, type EventAssignmentContact, type EventAssignmentKind } from "../event-assignment"

type DirectoryResponse = {
  data?: EventAssignmentContact[]
  pagination?: { totalPages?: number }
}

function AssignmentPicker({
  kind,
  value,
  initialContact,
  onChange,
  onBlur,
  inputRef,
  disabled,
}: {
  kind: EventAssignmentKind
  value: string
  initialContact?: EventAssignmentContact | null
  onChange: (value: string) => void
  onBlur: () => void
  inputRef: Ref<HTMLSelectElement>
  disabled: boolean
}) {
  const searchId = useId()
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [contacts, setContacts] = useState<EventAssignmentContact[]>([])
  const [chosen, setChosen] = useState<EventAssignmentContact | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [retry, setRetry] = useState(0)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [detailsError, setDetailsError] = useState("")
  const singular = kind === "organizers" ? "organizer" : "venue"

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError("")
    const timer = setTimeout(async () => {
      try {
        const query = new URLSearchParams({ page: String(page), limit: "25" })
        if (search.trim()) query.set("search", search.trim())
        const result = await adminApi<DirectoryResponse>(`/${kind}?${query}`)
        if (cancelled) return
        setContacts(Array.isArray(result.data) ? result.data : [])
        setTotalPages(Math.max(1, result.pagination?.totalPages || 1))
      } catch {
        if (cancelled) return
        setContacts([])
        setError(`Could not load ${kind}. Try again.`)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }, 250)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [kind, search, page, retry])

  useEffect(() => {
    let cancelled = false
    setDetailsError("")
    setDetailsLoading(false)
    if (!value || initialContact?.id === value) return
    setDetailsLoading(true)
    adminApi<{ data?: EventAssignmentContact }>(`/${kind}/${value}`)
      .then((result) => {
        if (cancelled) return
        if (!result.data || result.data.id !== value) throw new Error("Missing contact details")
        setChosen(result.data)
      })
      .catch(() => {
        if (!cancelled) setDetailsError(`Could not load complete ${singular} details.`)
      })
      .finally(() => {
        if (!cancelled) setDetailsLoading(false)
      })
    return () => { cancelled = true }
  }, [kind, value, initialContact?.id, singular, retry])

  const selected = (initialContact?.id === value ? initialContact : null)
    || (chosen?.id === value ? chosen : null)
    || contacts.find((contact) => contact.id === value)
  const options = selected && !contacts.some((contact) => contact.id === selected.id)
    ? [selected, ...contacts]
    : contacts

  return (
    <div className="space-y-3">
      <label htmlFor={searchId} className="sr-only">Search {kind}</label>
      <Input
        id={searchId}
        placeholder={kind === "organizers" ? "Search by organization, name or email" : "Search by venue, city or email"}
        value={search}
        onKeyDown={(event) => {
          if (event.key === "Enter") event.preventDefault()
        }}
        disabled={disabled}
        onChange={(event) => {
          setSearch(event.target.value)
          setPage(1)
        }}
      />
      <FormControl>
        <select
          className="h-10 w-full min-w-0 rounded-md border border-input bg-background px-3 text-sm disabled:opacity-50"
          value={value}
          name={kind === "organizers" ? "organizerId" : "venueId"}
          ref={inputRef}
          onChange={(event) => {
            setChosen(options.find((contact) => contact.id === event.target.value) || null)
            onChange(event.target.value)
          }}
          onBlur={onBlur}
          disabled={disabled || loading || !!error}
        >
          <option value="">{kind === "organizers" ? "Select an organizer" : "No venue assigned"}</option>
          {value && !selected ? <option value={value}>Current {singular}</option> : null}
          {options.map((contact) => (
            <option key={contact.id} value={contact.id}>
              {getAssignmentName(contact, kind)}{kind === "organizers" && contact.email ? ` - ${contact.email}` : kind === "venues" && contact.venueCity ? ` - ${contact.venueCity}` : ""}
            </option>
          ))}
        </select>
      </FormControl>
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground" aria-live="polite">
        <span>{loading ? `Loading ${kind}...` : error || (contacts.length ? `Page ${page} of ${totalPages}` : `No ${kind} found`)}</span>
        {error ? (
          <Button type="button" variant="outline" size="sm" disabled={disabled} onClick={() => setRetry((attempt) => attempt + 1)}>Retry</Button>
        ) : totalPages > 1 ? (
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" aria-label={`Previous ${kind} page`} disabled={disabled || loading || page <= 1} onClick={() => setPage((current) => current - 1)}>Previous</Button>
            <Button type="button" variant="outline" size="sm" aria-label={`Next ${kind} page`} disabled={disabled || loading || page >= totalPages} onClick={() => setPage((current) => current + 1)}>Next</Button>
          </div>
        ) : null}
      </div>
      {detailsLoading ? <p className="text-xs text-muted-foreground" aria-live="polite">Loading contact details...</p> : null}
      {detailsError ? <p className="text-xs text-red-600" role="alert">{detailsError} <button type="button" className="underline" disabled={disabled} onClick={() => setRetry((attempt) => attempt + 1)}>Retry</button></p> : null}
      {selected ? (
        <div className="rounded-lg border bg-muted/30 p-3">
          <p className="mb-3 break-words text-sm font-semibold">{getAssignmentName(selected, kind)}</p>
          <dl className="grid gap-2 text-sm">
            {getAssignmentDetails(selected, kind).map(([label, detail]) => (
              <div key={label} className="grid grid-cols-[100px_minmax(0,1fr)] gap-3">
                <dt className="text-muted-foreground">{label}</dt>
                <dd className="min-w-0 break-words">{detail || "Not provided"}</dd>
              </div>
            ))}
          </dl>
        </div>
      ) : <p className="text-sm text-muted-foreground">No {singular} selected.</p>}
    </div>
  )
}

export function EventAssignmentFields({ event, disabled = false }: { event: EditEventRecord; disabled?: boolean }) {
  const { control } = useFormContext<EditEventFormValues>()
  return (
    <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
      <FormField
        control={control}
        name="organizerId"
        render={({ field }) => (
          <FormItem className="rounded-lg border p-4">
            <FormLabel>Organizer *</FormLabel>
            <FormDescription>Select the organizer responsible for this event.</FormDescription>
            <AssignmentPicker kind="organizers" value={field.value} onChange={field.onChange} onBlur={field.onBlur} inputRef={field.ref} initialContact={event.organizerDetails} disabled={disabled} />
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="venueId"
        render={({ field }) => (
          <FormItem className="rounded-lg border p-4">
            <FormLabel>Venue</FormLabel>
            <FormDescription>Select the event venue to use its address and location.</FormDescription>
            <AssignmentPicker kind="venues" value={field.value} onChange={field.onChange} onBlur={field.onBlur} inputRef={field.ref} initialContact={event.venueDetails} disabled={disabled} />
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
