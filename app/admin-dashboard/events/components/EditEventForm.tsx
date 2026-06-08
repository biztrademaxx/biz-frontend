"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { AppImage } from "@/components/app-image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { apiFetch } from "@/lib/api"
import { uploadEventFileToBackend } from "@/components/organizer-create-event/upload-backend"
import { ArrowLeft } from "lucide-react"
import { editEventFormSchema, type EditEventFormValues } from "../edit-event-schema"
import {
  type EditEventCategory,
  type EditEventRecord,
  fileToBase64,
  mapPatchedEventToEditRecord,
  normalizeEventCategoryNames,
  scalarEventType,
  slugifyTitle,
  toDateOnly,
} from "../edit-event-form-utils"
import { AdminEventFileUpload, AdminEventImagePreview } from "./AdminEventFileUpload"

type EditEventFormProps = {
  event: EditEventRecord
  onSave: (updatedEvent: EditEventRecord) => void
  onCancel: () => void
  categories: EditEventCategory[]
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-2">{children}</h3>
}

export function EditEventForm({ event, onSave, onCancel, categories }: EditEventFormProps) {
  const [uploading, setUploading] = useState(false)
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)
  const [vipImageFile, setVipImageFile] = useState<File | null>(null)
  const [newImages, setNewImages] = useState<File[]>([])
  const [newVideos, setNewVideos] = useState<File[]>([])
  const [newDocuments, setNewDocuments] = useState<File[]>([])
  const [existingImages, setExistingImages] = useState<string[]>(event.images || [])
  const [existingVideos, setExistingVideos] = useState<string[]>(event.videos || [])
  const [existingDocuments, setExistingDocuments] = useState<string[]>(event.documents || [])

  const form = useForm<EditEventFormValues>({
    resolver: zodResolver(editEventFormSchema),
    defaultValues: {
      title: event.title,
      slug: event.slug || "",
      description: event.description,
      shortDescription: event.shortDescription || "",
      subTitle: event.subTitle || event.shortDescription || "",
      edition: event.edition || "",
      date: toDateOnly(event.date),
      endDate: toDateOnly(event.endDate),
      timezone: event.timezone || "IST",
      maxCapacity: event.maxCapacity,
      attendees: event.attendees ?? 0,
      ticketPrice: event.ticketPrice ?? 0,
      eventType: scalarEventType(event.eventType),
      currency: event.currency || "USD",
      categoryNames: normalizeEventCategoryNames(event),
      tagsInput: (event.tags || []).join(", "),
      status: event.status,
      featured: !!event.featured,
      vip: !!event.vip,
      isPublic: event.isPublic ?? true,
      isVerified: !!event.isVerified,
      youtubeVideoUrl: event.youtubeVideoUrl ?? "",
      bannerImage: event.bannerImage || "",
      thumbnailImage: event.thumbnailImage || "",
      vipImage: event.vipImage || "",
      brochure: event.brochure || "",
      layout: event.layout || "",
    },
  })

  const watchTitle = form.watch("title")
  const watchVip = form.watch("vip")
  const watchVipImage = form.watch("vipImage")

  useEffect(() => {
    setSlugManuallyEdited(false)
    setVipImageFile(null)
    setExistingImages(event.images || [])
    setExistingVideos(event.videos || [])
    setExistingDocuments(event.documents || [])
    form.reset({
      title: event.title,
      slug: event.slug || "",
      description: event.description,
      shortDescription: event.shortDescription || "",
      subTitle: event.subTitle || event.shortDescription || "",
      edition: event.edition || "",
      date: toDateOnly(event.date),
      endDate: toDateOnly(event.endDate),
      timezone: event.timezone || "IST",
      maxCapacity: event.maxCapacity,
      attendees: event.attendees ?? 0,
      ticketPrice: event.ticketPrice ?? 0,
      eventType: scalarEventType(event.eventType),
      currency: event.currency || "USD",
      categoryNames: normalizeEventCategoryNames(event),
      tagsInput: (event.tags || []).join(", "),
      status: event.status,
      featured: !!event.featured,
      vip: !!event.vip,
      isPublic: event.isPublic ?? true,
      isVerified: !!event.isVerified,
      youtubeVideoUrl: event.youtubeVideoUrl ?? "",
      bannerImage: event.bannerImage || "",
      thumbnailImage: event.thumbnailImage || "",
      vipImage: event.vipImage || "",
      brochure: event.brochure || "",
      layout: event.layout || "",
    })
  }, [event.id, form, event])

  useEffect(() => {
    if (slugManuallyEdited) return
    const autoSlug = slugifyTitle(watchTitle || "")
    if (form.getValues("slug") !== autoSlug) {
      form.setValue("slug", autoSlug, { shouldValidate: true })
    }
  }, [watchTitle, slugManuallyEdited, form])

  const activeCategories = categories.filter((c) => c.isActive)

  const onSubmit = async (values: EditEventFormValues) => {
    if (values.vip && !vipImageFile && !values.vipImage.trim()) {
      form.setError("vipImage", { message: "Upload a VIP image when VIP is enabled" })
      return
    }

    setUploading(true)
    try {
      const [newImageBase64, newVideoBase64, newDocumentBase64] = await Promise.all([
        Promise.all(newImages.map(fileToBase64)),
        Promise.all(newVideos.map(fileToBase64)),
        Promise.all(newDocuments.map(fileToBase64)),
      ])

      let vipImageUrl = values.vipImage.trim()
      if (values.vip) {
        if (vipImageFile) {
          vipImageUrl = await uploadEventFileToBackend(vipImageFile, "image")
        }
        if (!vipImageUrl) {
          form.setError("vipImage", { message: "VIP image is required when VIP is enabled" })
          return
        }
      } else {
        vipImageUrl = ""
      }

      const updateData: Record<string, unknown> = {
        title: values.title,
        description: values.description,
        shortDescription: values.shortDescription ?? "",
        subTitle: values.subTitle ?? values.shortDescription ?? "",
        slug: values.slug,
        edition: values.edition ?? "",
        startDate: values.date,
        endDate: values.endDate,
        status: values.status,
        maxCapacity: values.maxCapacity,
        currentAttendees: values.attendees,
        featured: values.featured,
        vip: values.vip,
        isPublic: values.isPublic,
        category: values.categoryNames,
        tags: values.tagsInput
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        eventType: [values.eventType],
        timezone: values.timezone,
        currency: values.currency,
        images: [...existingImages, ...newImageBase64],
        videos: [...existingVideos, ...newVideoBase64],
        documents: [...existingDocuments, ...newDocumentBase64],
        brochure: values.brochure ?? "",
        layout: values.layout ?? "",
        bannerImage: values.bannerImage ?? "",
        vipImage: vipImageUrl || null,
        thumbnailImage: values.thumbnailImage ?? "",
        isVerified: values.isVerified,
        verifiedBadgeImage: event.verifiedBadgeImage ?? null,
        youtubeVideoUrl: values.youtubeVideoUrl?.trim() ? values.youtubeVideoUrl.trim() : null,
      }

      const result = await apiFetch<{ event?: Record<string, unknown>; data?: Record<string, unknown> }>(
        `/api/admin/events/${event.id}`,
        { method: "PATCH", body: updateData, auth: true },
      )
      const savedRaw = result.event ?? result.data
      if (savedRaw && typeof savedRaw === "object") {
        const savedEvent = mapPatchedEventToEditRecord(savedRaw, event)
        setVipImageFile(null)
        form.setValue("vipImage", savedEvent.vipImage || "")
        onSave(savedEvent)
      } else {
        throw new Error("No event data returned from server")
      }
    } catch (error) {
      console.error("Error updating event:", error)
      const msg = error instanceof Error ? error.message : "Failed to update event"
      form.setError("root", { message: msg })
    } finally {
      setUploading(false)
    }
  }

  const vipPreviewSrc = vipImageFile
    ? URL.createObjectURL(vipImageFile)
    : watchVipImage || ""

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button type="button" variant="ghost" size="icon" onClick={onCancel}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Event</h1>
          <p className="text-sm text-muted-foreground">Update event details</p>
        </div>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {form.formState.errors.root?.message ? (
                <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {form.formState.errors.root.message}
                </p>
              ) : null}

              <section className="space-y-4">
                <SectionTitle>Basic Information</SectionTitle>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Event Title *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter event title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Slug *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="event-slug"
                            {...field}
                            onChange={(e) => {
                              setSlugManuallyEdited(e.target.value.length > 0)
                              field.onChange(slugifyTitle(e.target.value))
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="edition"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Edition</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. 2026" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="subTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Sub Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Optional sub title" maxLength={200} {...field} />
                      </FormControl>
                      <FormDescription>{(field.value ?? "").length}/200 characters</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="shortDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Short Description</FormLabel>
                      <FormControl>
                        <Textarea rows={2} maxLength={200} placeholder="Brief summary" {...field} />
                      </FormControl>
                      <FormDescription>{(field.value ?? "").length}/200 characters</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Description *</FormLabel>
                      <FormControl>
                        <Textarea rows={4} placeholder="Detailed event description" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </section>

              <section className="space-y-4">
                <SectionTitle>Date & Time</SectionTitle>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="timezone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Timezone *</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select timezone" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="UTC">UTC</SelectItem>
                            <SelectItem value="EST">Eastern (EST)</SelectItem>
                            <SelectItem value="PST">Pacific (PST)</SelectItem>
                            <SelectItem value="CST">Central (CST)</SelectItem>
                            <SelectItem value="IST">India (IST)</SelectItem>
                            <SelectItem value="GMT">GMT</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </section>

              <section className="space-y-4">
                <SectionTitle>Location & Venue</SectionTitle>
                <p className="text-xs text-muted-foreground">Read-only on edit (change via event setup if needed).</p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormItem>
                    <FormLabel>Venue</FormLabel>
                    <FormControl>
                      <Input value={event.venue} disabled className="bg-muted/50" />
                    </FormControl>
                  </FormItem>
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input value={event.location} disabled className="bg-muted/50" />
                    </FormControl>
                  </FormItem>
                </div>
              </section>

              <section className="space-y-4">
                <SectionTitle>Event Details</SectionTitle>
                <FormField
                  control={form.control}
                  name="categoryNames"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categories *</FormLabel>
                      {activeCategories.length === 0 ? (
                        <p className="text-sm text-amber-800 rounded-lg border border-amber-100 bg-amber-50 p-3">
                          No active categories. Add them under Events → Event Categories.
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                          {activeCategories.map((cat) => {
                            const checked = field.value.includes(cat.name)
                            return (
                              <label
                                key={cat.id}
                                className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 transition ${
                                  checked
                                    ? "border-blue-500 bg-blue-50/80 ring-1 ring-blue-100"
                                    : "border-gray-200 hover:bg-gray-50"
                                }`}
                              >
                                <Checkbox
                                  checked={checked}
                                  onCheckedChange={(v) => {
                                    const on = v === true
                                    if (on) field.onChange([...field.value, cat.name])
                                    else field.onChange(field.value.filter((n) => n !== cat.name))
                                  }}
                                />
                                <span
                                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                                  style={{ backgroundColor: cat.color || "#3B82F6" }}
                                />
                                <span className="text-sm font-medium">{cat.name}</span>
                              </label>
                            )
                          })}
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="eventType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Event Type *</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="in-person">In-Person</SelectItem>
                            <SelectItem value="virtual">Virtual</SelectItem>
                            <SelectItem value="hybrid">Hybrid</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Currency *</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="USD">USD ($)</SelectItem>
                            <SelectItem value="EUR">EUR (€)</SelectItem>
                            <SelectItem value="GBP">GBP (£)</SelectItem>
                            <SelectItem value="INR">INR (₹)</SelectItem>
                            <SelectItem value="CAD">CAD (C$)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="tagsInput"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tags</FormLabel>
                      <FormControl>
                        <Input placeholder="Comma-separated tags" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </section>

              <section className="space-y-4">
                <SectionTitle>Capacity & Pricing</SectionTitle>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="maxCapacity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Capacity *</FormLabel>
                        <FormControl>
                          <Input type="number" min={1} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="attendees"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Attendees</FormLabel>
                        <FormControl>
                          <Input type="number" min={0} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="ticketPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ticket Price</FormLabel>
                        <FormControl>
                          <Input type="number" min={0} step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </section>

              <section className="space-y-4">
                <SectionTitle>Media & Documents</SectionTitle>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="bannerImage"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex flex-wrap items-start gap-3">
                          {field.value ? (
                            <AdminEventImagePreview src={field.value} onRemove={() => field.onChange("")} />
                          ) : null}
                          <div className="min-w-0 flex-1">
                            <AdminEventFileUpload
                              label="Banner Image"
                              accept="image/*"
                              onFileUpload={async (files) => {
                                if (files[0]) field.onChange(await fileToBase64(files[0]))
                              }}
                            />
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="thumbnailImage"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex flex-wrap items-start gap-3">
                          {field.value ? (
                            <AdminEventImagePreview src={field.value} onRemove={() => field.onChange("")} />
                          ) : null}
                          <div className="min-w-0 flex-1">
                            <AdminEventFileUpload
                              label="Thumbnail Image"
                              accept="image/*"
                              onFileUpload={async (files) => {
                                if (files[0]) field.onChange(await fileToBase64(files[0]))
                              }}
                            />
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <AdminEventFileUpload
                  label="Gallery Images"
                  accept="image/*"
                  multiple
                  currentFiles={existingImages}
                  onFileUpload={(files) => setNewImages((p) => [...p, ...files])}
                  onFileRemove={(i) => setExistingImages((p) => p.filter((_, idx) => idx !== i))}
                />
                {newImages.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {newImages.map((file, i) => (
                      <AdminEventImagePreview
                        key={i}
                        src={URL.createObjectURL(file)}
                        onRemove={() => setNewImages((p) => p.filter((_, idx) => idx !== i))}
                      />
                    ))}
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="youtubeVideoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>YouTube Video URL</FormLabel>
                      <FormControl>
                        <Input type="url" placeholder="https://www.youtube.com/watch?v=…" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="brochure"
                    render={({ field }) => (
                      <FormItem>
                        <AdminEventFileUpload
                          label="Brochure"
                          accept=".pdf,.doc,.docx"
                          currentFiles={field.value ? [field.value] : []}
                          onFileUpload={async (files) => {
                            if (files[0]) field.onChange(await fileToBase64(files[0]))
                          }}
                          onFileRemove={() => field.onChange("")}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="layout"
                    render={({ field }) => (
                      <FormItem>
                        <AdminEventFileUpload
                          label="Layout Plan"
                          accept=".pdf,.jpg,.jpeg,.png"
                          currentFiles={field.value ? [field.value] : []}
                          onFileUpload={async (files) => {
                            if (files[0]) field.onChange(await fileToBase64(files[0]))
                          }}
                          onFileRemove={() => field.onChange("")}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </section>

              <section className="space-y-4 rounded-xl border border-violet-100 bg-violet-50/30 p-4">
                <SectionTitle>VIP & Homepage Images</SectionTitle>
                <p className="text-xs text-muted-foreground -mt-2">
                  VIP image appears on the homepage VIP section only.
                </p>

                <FormField
                  control={form.control}
                  name="vip"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center gap-2 space-y-0">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel className="font-medium cursor-pointer">VIP Event</FormLabel>
                    </FormItem>
                  )}
                />

                {watchVip ? (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="vipImage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>VIP Image *</FormLabel>
                          <div className="flex flex-wrap items-start gap-3">
                            {vipPreviewSrc ? (
                              <div className="space-y-2">
                                <AppImage
                                  src={vipPreviewSrc}
                                  alt="VIP preview"
                                  width={120}
                                  height={120}
                                  className="h-28 w-28 rounded-lg border object-cover"
                                  unoptimized
                                />
                                {!vipImageFile && field.value ? (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => field.onChange("")}
                                  >
                                    Remove current
                                  </Button>
                                ) : null}
                              </div>
                            ) : null}
                            <div className="min-w-0 flex-1">
                              <AdminEventFileUpload
                                label="Upload VIP Image"
                                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/avif,image/svg+xml,.jpg,.jpeg,.png,.webp,.gif,.avif,.svg"
                                error={form.formState.errors.vipImage?.message}
                                onFileUpload={(files) => {
                                  const f = files[0]
                                  if (!f) return
                                  setVipImageFile(f)
                                  field.onChange("")
                                  form.clearErrors("vipImage")
                                }}
                              />
                            </div>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex items-center rounded-lg border border-dashed border-violet-200 bg-white/60 p-4 text-sm text-muted-foreground">
                      Recommended: high-quality landscape image. Shown only when this event is marked VIP.
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Enable VIP Event to upload a VIP image.</p>
                )}
              </section>

              <section className="space-y-4">
                <SectionTitle>Status & Features</SectionTitle>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Approved">Approved</SelectItem>
                            <SelectItem value="Pending Review">Pending Review</SelectItem>
                            <SelectItem value="Flagged">Flagged</SelectItem>
                            <SelectItem value="Rejected">Rejected</SelectItem>
                            <SelectItem value="Draft">Draft</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="space-y-3 rounded-lg border border-gray-100 bg-gray-50/50 p-4">
                    <p className="text-sm font-medium text-gray-800">Features</p>
                    <FormField
                      control={form.control}
                      name="featured"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center gap-2 space-y-0">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <FormLabel className="cursor-pointer font-normal">Featured Event</FormLabel>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="isPublic"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center gap-2 space-y-0">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <FormLabel className="cursor-pointer font-normal">Public Event</FormLabel>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="isVerified"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center gap-2 space-y-0">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <FormLabel className="cursor-pointer font-normal">Verified Event</FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </section>

              <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-end">
                <Button type="button" variant="outline" onClick={onCancel} disabled={uploading} className="sm:min-w-[140px]">
                  Cancel
                </Button>
                <Button type="submit" disabled={uploading} className="sm:min-w-[160px]">
                  {uploading ? "Saving…" : "Save Changes"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
