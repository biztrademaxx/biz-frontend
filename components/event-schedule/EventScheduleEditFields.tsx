"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  convertLocalToUTC,
  getDatePart,
  getTimePart,
} from "@/components/organizer-create-event/utils"

export type EventScheduleFormState = {
  startDate: string
  endDate: string
  startTime: string
  endTime: string
}

export function scheduleFormFromEvent(event: {
  startDate?: string
  endDate?: string
}): EventScheduleFormState {
  return {
    startDate: event.startDate ? getDatePart(event.startDate) : "",
    endDate: event.endDate ? getDatePart(event.endDate) : "",
    startTime: event.startDate ? getTimePart(event.startDate) : "10:00",
    endTime: event.endDate ? getTimePart(event.endDate) : "18:00",
  }
}

export function buildScheduleIsoPayload(
  form: EventScheduleFormState,
  timezone: string,
): { startDate: string; endDate: string } | null {
  if (!form.startDate || !form.endDate || !form.startTime || !form.endTime) return null

  const startDate =
    convertLocalToUTC(form.startTime, form.startDate, timezone) ||
    new Date(`${form.startDate}T${form.startTime}:00`).toISOString()
  const endDate =
    convertLocalToUTC(form.endTime, form.endDate, timezone) ||
    new Date(`${form.endDate}T${form.endTime}:00`).toISOString()

  if (new Date(endDate) < new Date(startDate)) return null
  return { startDate, endDate }
}

type Props = {
  form: EventScheduleFormState
  onChange: (next: EventScheduleFormState) => void
  onSave: () => void
  onCancel: () => void
  saving?: boolean
}

export function EventScheduleEditFields({ form, onChange, onSave, onCancel, saving }: Props) {
  return (
    <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-3 space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs text-gray-600">Start date</Label>
          <Input
            type="date"
            value={form.startDate}
            onChange={(e) => onChange({ ...form, startDate: e.target.value })}
            className="h-9 bg-white"
          />
        </div>
        <div>
          <Label className="text-xs text-gray-600">End date</Label>
          <Input
            type="date"
            value={form.endDate}
            onChange={(e) => onChange({ ...form, endDate: e.target.value })}
            className="h-9 bg-white"
          />
        </div>
        <div>
          <Label className="text-xs text-gray-600">Start time</Label>
          <Input
            type="time"
            value={form.startTime}
            onChange={(e) => onChange({ ...form, startTime: e.target.value })}
            className="h-9 bg-white"
          />
        </div>
        <div>
          <Label className="text-xs text-gray-600">End time</Label>
          <Input
            type="time"
            value={form.endTime}
            onChange={(e) => onChange({ ...form, endTime: e.target.value })}
            className="h-9 bg-white"
          />
        </div>
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={onSave} disabled={saving}>
          {saving ? "Saving…" : "Save"}
        </Button>
        <Button size="sm" variant="outline" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
      </div>
    </div>
  )
}
