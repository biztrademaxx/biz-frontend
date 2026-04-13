"use client"

import { useEffect, useState } from "react"
import { apiFetch } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Pencil, Trash2, RefreshCw } from "lucide-react"
import CloudinaryUpload from "@/components/cloudinary-upload"
import { cn } from "@/lib/utils"

export type CmsType = "NEWS" | "BLOG" | "FEATURED_EVENT" | "MEDIA"

export interface ContentItemRow {
  id: string
  type: string
  title?: string | null
  slug?: string | null
  body?: string | null
  extras?: Record<string, unknown> | null
  published: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export default function CmsItemsPage({
  type,
  heading,
  description,
}: {
  type: CmsType
  heading: string
  description: string
}) {
  const [items, setItems] = useState<ContentItemRow[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<ContentItemRow | null>(null)
  const [form, setForm] = useState({
    title: "",
    slug: "",
    body: "",
    eventId: "",
    mediaUrl: "",
    fileName: "",
    coverImageUrl: "",
    coverImagePublicId: "",
    author: "",
    tag: "",
    published: false,
    sortOrder: 0,
  })

  const load = async () => {
    try {
      setLoading(true)
      setLoadError(null)
      const res = await apiFetch<{ success?: boolean; data?: ContentItemRow[] }>(
        `/api/admin/content/items?type=${type}`,
        { auth: true },
      )
      setItems(Array.isArray(res.data) ? res.data : [])
    } catch (e: unknown) {
      console.error(e)
      const msg = e instanceof Error ? e.message : "Failed to load items"
      setLoadError(msg)
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [type])

  const openCreate = () => {
    setEditing(null)
    setForm({
      title: "",
      slug: "",
      body: "",
      eventId: "",
      mediaUrl: "",
      fileName: "",
      coverImageUrl: "",
      coverImagePublicId: "",
      author: "",
      tag: "",
      published: false,
      sortOrder: 0,
    })
    setDialogOpen(true)
  }

  const openEdit = (row: ContentItemRow) => {
    setEditing(row)
    const ex = row.extras ?? {}
    setForm({
      title: row.title ?? "",
      slug: row.slug ?? "",
      body: row.body ?? "",
      eventId: String(ex.eventId ?? ""),
      mediaUrl: String(ex.url ?? ""),
      fileName: String(ex.fileName ?? ""),
      coverImageUrl: String(ex.coverImageUrl ?? ""),
      coverImagePublicId: String(ex.coverImagePublicId ?? ""),
      author: String(ex.author ?? ""),
      tag: String(ex.tag ?? ""),
      published: row.published,
      sortOrder: row.sortOrder,
    })
    setDialogOpen(true)
  }

  const buildExtras = () => {
    if (type === "FEATURED_EVENT") return { eventId: form.eventId.trim() }
    if (type === "MEDIA")
      return {
        url: form.mediaUrl.trim(),
        fileName: form.fileName.trim() || "asset",
        mime: "application/octet-stream",
      }
    if (type === "BLOG") {
      return {
        ...(form.coverImageUrl.trim() ? { coverImageUrl: form.coverImageUrl.trim() } : {}),
        ...(form.coverImagePublicId.trim() ? { coverImagePublicId: form.coverImagePublicId.trim() } : {}),
        ...(form.author.trim() ? { author: form.author.trim() } : {}),
        ...(form.tag.trim() ? { tag: form.tag.trim() } : {}),
      }
    }
    return undefined
  }

  const save = async () => {
    try {
      if (type === "FEATURED_EVENT" && !form.eventId.trim()) {
        alert("Event ID is required for featured events")
        return
      }
      if (type === "MEDIA" && !form.mediaUrl.trim()) {
        alert("Media URL is required")
        return
      }
      const extras = buildExtras()
      if (editing) {
        await apiFetch(`/api/admin/content/items/${editing.id}`, {
          method: "PATCH",
          body: {
            title: form.title || null,
            slug: form.slug || null,
            body: form.body || null,
            extras,
            published: form.published,
            sortOrder: form.sortOrder,
          },
          auth: true,
        })
      } else {
        await apiFetch("/api/admin/content/items", {
          method: "POST",
          body: {
            type,
            title: form.title || null,
            slug: form.slug || null,
            body: form.body || null,
            extras,
            published: form.published,
            sortOrder: form.sortOrder,
          },
          auth: true,
        })
      }
      setDialogOpen(false)
      await load()
    } catch (e: any) {
      alert(e?.message || "Save failed")
    }
  }

  const remove = async (id: string) => {
    if (!confirm("Delete this item?")) return
    try {
      await apiFetch(`/api/admin/content/items/${id}`, { method: "DELETE", auth: true })
      await load()
    } catch (e: any) {
      alert(e?.message || "Delete failed")
    }
  }

  const togglePublish = async (row: ContentItemRow) => {
    try {
      await apiFetch(`/api/admin/content/items/${row.id}`, {
        method: "PATCH",
        body: { published: !row.published },
        auth: true,
      })
      await load()
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="space-y-6 p-2">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{heading}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => void load()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Add
          </Button>
        </div>
      </div>

      {loadError ? (
        <p className="text-sm text-destructive" role="alert">
          {loadError}
        </p>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Items</CardTitle>
          <CardDescription>{items.length} total</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-muted-foreground">No items yet. Click Add to create one.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium max-w-[280px] truncate">
                      {row.title || row.slug || row.id.slice(0, 8)}
                      {type === "FEATURED_EVENT" && row.extras?.eventId != null && (
                        <span className="block text-xs text-muted-foreground">Event: {String(row.extras.eventId)}</span>
                      )}
                      {type === "MEDIA" && row.extras?.url != null && (
                        <span className="block text-xs text-muted-foreground truncate">{String(row.extras.url)}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={row.published ? "default" : "secondary"}>
                        {row.published ? "Published" : "Draft"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(row.updatedAt).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Switch checked={row.published} onCheckedChange={() => void togglePublish(row)} />
                      <Button variant="ghost" size="icon" onClick={() => openEdit(row)} aria-label="Edit">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => void remove(row.id)} aria-label="Delete">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          className={cn("max-h-[90vh] overflow-y-auto", type === "BLOG" ? "max-w-2xl" : "max-w-lg")}
        >
          <DialogHeader>
            <DialogTitle>{editing ? "Edit" : "Create"}</DialogTitle>
            <DialogDescription>{heading}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {(type === "NEWS" || type === "BLOG" || type === "MEDIA") && (
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
              </div>
            )}
            {type === "BLOG" && (
              <>
                <div className="space-y-2">
                  <Label>Slug</Label>
                  <Input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Cover image</Label>
                  <CloudinaryUpload
                    folder="blog/covers"
                    currentImage={form.coverImageUrl || undefined}
                    onUploadComplete={(url, meta) =>
                      setForm((f) => ({
                        ...f,
                        coverImageUrl: url,
                        coverImagePublicId: url.trim() ? (meta?.publicId ?? f.coverImagePublicId) : "",
                      }))
                    }
                    emptyLabel="Upload cover image"
                    changeLabel="Change cover image"
                    previewClassName="w-full max-w-md h-44 object-cover rounded-lg border border-gray-200"
                  />
                  <p className="text-xs text-muted-foreground">
                    Shown on the public blog listing. Images are stored on Cloudinary (same as other admin uploads).
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Author (optional)</Label>
                  <Input
                    value={form.author}
                    onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
                    placeholder="e.g. Editorial team"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tag / category (optional)</Label>
                  <Input
                    value={form.tag}
                    onChange={(e) => setForm((f) => ({ ...f, tag: e.target.value }))}
                    placeholder="e.g. Story now"
                  />
                </div>
              </>
            )}
            {(type === "NEWS" || type === "BLOG") && (
              <div className="space-y-2">
                <Label>Body</Label>
                <Textarea
                  rows={6}
                  value={form.body}
                  onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                />
              </div>
            )}
            {type === "FEATURED_EVENT" && (
              <div className="space-y-2">
                <Label>Event ID (UUID)</Label>
                <Input value={form.eventId} onChange={(e) => setForm((f) => ({ ...f, eventId: e.target.value }))} />
                <p className="text-xs text-muted-foreground">Paste an existing event id from your database.</p>
              </div>
            )}
            {type === "MEDIA" && (
              <>
                <div className="space-y-2">
                  <Label>File URL</Label>
                  <Input value={form.mediaUrl} onChange={(e) => setForm((f) => ({ ...f, mediaUrl: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>File name</Label>
                  <Input value={form.fileName} onChange={(e) => setForm((f) => ({ ...f, fileName: e.target.value }))} />
                </div>
                <p className="text-xs text-muted-foreground">Upload via Admin → Upload, then paste secure_url here.</p>
              </>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Sort order</Label>
                <Input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) || 0 }))}
                />
              </div>
              <div className="flex items-center gap-2 pt-8">
                <Switch checked={form.published} onCheckedChange={(v) => setForm((f) => ({ ...f, published: v }))} />
                <Label>Published</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => void save()}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
