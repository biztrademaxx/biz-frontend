"use client"

import { useMemo } from "react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getCityOptions, getCountryOptions, getStateOptions } from "@/lib/location-data"

export type ProfileLocationValue = {
  country: string
  state: string
  city: string
}

type ProfileLocationFieldsProps = {
  value: ProfileLocationValue
  onChange: (next: ProfileLocationValue) => void
  disabled?: boolean
  className?: string
}

const NONE = "__none__"

export function ProfileLocationFields({
  value,
  onChange,
  disabled = false,
  className = "",
}: ProfileLocationFieldsProps) {
  const countryOptions = useMemo(() => getCountryOptions(), [])

  const countryPick = useMemo(() => {
    const name = value.country.trim().toLowerCase()
    if (!name) return NONE
    const row = countryOptions.find((c) => c.name.trim().toLowerCase() === name)
    return row?.code ?? NONE
  }, [value.country, countryOptions])

  const stateOptions = useMemo(() => {
    if (countryPick === NONE) return []
    return getStateOptions(countryPick)
  }, [countryPick])

  const statePick = useMemo(() => {
    const name = value.state.trim().toLowerCase()
    if (!name) return NONE
    const row = stateOptions.find((s) => s.name.trim().toLowerCase() === name)
    return row?.code ?? NONE
  }, [value.state, stateOptions])

  const cityOptions = useMemo(() => {
    if (countryPick === NONE || statePick === NONE) return []
    return getCityOptions(countryPick, statePick)
  }, [countryPick, statePick])

  const cityPick = useMemo(() => {
    const name = value.city.trim()
    if (!name) return NONE
    if (cityOptions.some((c) => c.name === name)) return name
    return NONE
  }, [value.city, cityOptions])

  return (
    <div className={`grid grid-cols-1 gap-4 md:grid-cols-3 ${className}`}>
      <div className="space-y-1.5">
        <Label>Country</Label>
        <Select
          value={countryPick}
          disabled={disabled}
          onValueChange={(code) => {
            if (code === NONE) {
              onChange({ country: "", state: "", city: "" })
              return
            }
            const row = countryOptions.find((c) => c.code === code)
            if (row) onChange({ country: row.name, state: "", city: "" })
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Choose country" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NONE}>— None —</SelectItem>
            {countryOptions.map((c) => (
              <SelectItem key={c.code} value={c.code}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label>State / Region</Label>
        <Select
          value={statePick}
          disabled={disabled || countryPick === NONE}
          onValueChange={(code) => {
            if (code === NONE) {
              onChange({ ...value, state: "", city: "" })
              return
            }
            const row = stateOptions.find((s) => s.code === code)
            if (row) onChange({ ...value, state: row.name, city: "" })
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={countryPick === NONE ? "Choose country first" : "Choose state"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NONE}>— None —</SelectItem>
            {stateOptions.map((s) => (
              <SelectItem key={s.code} value={s.code}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label>City</Label>
        <Select
          value={cityPick}
          disabled={disabled || countryPick === NONE || statePick === NONE}
          onValueChange={(name) => {
            if (name === NONE) {
              onChange({ ...value, city: "" })
              return
            }
            onChange({ ...value, city: name })
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue
              placeholder={
                countryPick === NONE
                  ? "Choose country first"
                  : statePick === NONE
                    ? "Choose state first"
                    : "Choose city"
              }
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NONE}>— None —</SelectItem>
            {cityOptions.map((c) => (
              <SelectItem key={c.name} value={c.name}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

export function formatProfileLocationLine(parts: ProfileLocationValue): string {
  return [parts.city, parts.state, parts.country].filter(Boolean).join(", ")
}

/** Best-effort parse of legacy `location` string when structured fields are empty. */
export function profileLocationFromLegacy(
  location?: string | null,
  structured?: Partial<ProfileLocationValue> | null,
): ProfileLocationValue {
  const city = structured?.city?.trim() ?? ""
  const state = structured?.state?.trim() ?? ""
  const country = structured?.country?.trim() ?? ""
  if (city || state || country) return { city, state, country }

  const raw = (location ?? "").trim()
  if (!raw) return { city: "", state: "", country: "" }

  const segments = raw.split(",").map((s) => s.trim()).filter(Boolean)
  if (segments.length >= 3) {
    return {
      city: segments[0] ?? "",
      state: segments[1] ?? "",
      country: segments.slice(2).join(", "),
    }
  }
  if (segments.length === 2) {
    return { city: segments[0] ?? "", state: "", country: segments[1] ?? "" }
  }
  return { city: raw, state: "", country: "" }
}
