"use client"

import { useEffect, useMemo, useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getCityOptions, getCountryOptions, getStateOptions } from "@/lib/location-data"

const LOCATION_NONE = "__none__"

export type OrganizerLocationSelectsProps = {
  country: string
  state: string
  city: string
  onCountryChange: (name: string) => void
  onStateChange: (name: string) => void
  onCityChange: (name: string) => void
  labelClassName?: string
  disabled?: boolean
}

export function OrganizerLocationSelects({
  country,
  state,
  city,
  onCountryChange,
  onStateChange,
  onCityChange,
  labelClassName = "text-sm font-medium",
  disabled = false,
}: OrganizerLocationSelectsProps) {
  const countryOptions = useMemo(() => getCountryOptions(), [])
  const [countryPick, setCountryPick] = useState<string>(LOCATION_NONE)
  const [statePick, setStatePick] = useState<string>(LOCATION_NONE)
  const [cityPick, setCityPick] = useState<string>(LOCATION_NONE)

  useEffect(() => {
    const countryName = country.trim().toLowerCase()
    const countryCode = countryOptions.find((c) => c.name.trim().toLowerCase() === countryName)?.code
    setCountryPick(countryCode || LOCATION_NONE)

    const statesForCountry = getStateOptions(countryCode || "")
    const stateName = state.trim().toLowerCase()
    const stateCode = statesForCountry.find((s) => s.name.trim().toLowerCase() === stateName)?.code
    setStatePick(stateCode || LOCATION_NONE)

    const citiesForState = getCityOptions(countryCode || "", stateCode || "")
    const cityName = city.trim().toLowerCase()
    const cityValue = citiesForState.find((c) => c.name.trim().toLowerCase() === cityName)?.name
    setCityPick(cityValue || LOCATION_NONE)
  }, [country, state, city, countryOptions])

  const resolvedCountryCode = useMemo(() => {
    if (countryPick !== LOCATION_NONE) return countryPick
    const typed = country.trim().toLowerCase()
    if (!typed) return ""
    return countryOptions.find((c) => c.name.trim().toLowerCase() === typed)?.code ?? ""
  }, [countryPick, country, countryOptions])

  const stateOptions = useMemo(() => getStateOptions(resolvedCountryCode), [resolvedCountryCode])

  const resolvedStateCode = useMemo(() => {
    if (statePick !== LOCATION_NONE) return statePick
    const typed = state.trim().toLowerCase()
    if (!typed) return ""
    return stateOptions.find((s) => s.name.trim().toLowerCase() === typed)?.code ?? ""
  }, [statePick, state, stateOptions])

  const cityOptions = useMemo(
    () => getCityOptions(resolvedCountryCode, resolvedStateCode),
    [resolvedCountryCode, resolvedStateCode],
  )

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
      <div className="space-y-2">
        <label className={labelClassName}>Country</label>
        <Select
          value={countryPick}
          disabled={disabled}
          onValueChange={(value) => {
            setCountryPick(value)
            if (value === LOCATION_NONE) {
              onCountryChange("")
              onStateChange("")
              onCityChange("")
              setStatePick(LOCATION_NONE)
              setCityPick(LOCATION_NONE)
              return
            }
            const row = countryOptions.find((c) => c.code === value)
            if (!row) return
            setStatePick(LOCATION_NONE)
            setCityPick(LOCATION_NONE)
            onCountryChange(row.name)
            onStateChange("")
            onCityChange("")
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select country" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={LOCATION_NONE}>-- None --</SelectItem>
            {countryOptions.map((c) => (
              <SelectItem key={c.code} value={c.code}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className={labelClassName}>State</label>
        <Select
          value={statePick}
          disabled={disabled || !resolvedCountryCode}
          onValueChange={(value) => {
            setStatePick(value)
            if (value === LOCATION_NONE) {
              onStateChange("")
              onCityChange("")
              setCityPick(LOCATION_NONE)
              return
            }
            const row = stateOptions.find((s) => s.code === value)
            if (!row) return
            setCityPick(LOCATION_NONE)
            onStateChange(row.name)
            onCityChange("")
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder={!resolvedCountryCode ? "Select country first" : "Select state"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={LOCATION_NONE}>-- None --</SelectItem>
            {stateOptions.map((s) => (
              <SelectItem key={s.code} value={s.code}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className={labelClassName}>City</label>
        <Select
          value={cityPick}
          disabled={disabled || !resolvedCountryCode || !resolvedStateCode}
          onValueChange={(value) => {
            setCityPick(value)
            if (value === LOCATION_NONE) {
              onCityChange("")
              return
            }
            const row = cityOptions.find((c) => c.name === value)
            if (row) onCityChange(row.name)
          }}
        >
          <SelectTrigger>
            <SelectValue
              placeholder={
                !resolvedCountryCode
                  ? "Select country first"
                  : !resolvedStateCode
                    ? "Select state first"
                    : "Select city"
              }
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={LOCATION_NONE}>-- None --</SelectItem>
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
