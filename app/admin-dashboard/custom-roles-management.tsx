"use client"

import { useEffect, useState } from "react"
import { adminApi } from "@/lib/admin-api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { ChevronDown, ChevronRight, Plus, Pencil, Trash2, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import {
  ADMIN_PERMISSION_CATEGORIES,
  groupPermissionCategoriesForColumns,
  type PermissionCategory,
} from "./permission-categories"

type RoleRow = {
  id: string
  slug: string
  name: string
  description: string | null
  defaultPermissions: string[]
  isActive: boolean
  isSystem: boolean
  sortOrder: number
}

export default function CustomRolesManagement() {
  const [roles, setRoles] = useState<RoleRow[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<RoleRow | null>(null)
  const [expanded, setExpanded] = useState<string[]>([])
  const [selectedPerms, setSelectedPerms] = useState<string[]>([])
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    sortOrder: 100,
    isActive: true,
  })

  const permissionCategories: PermissionCategory[] = ADMIN_PERMISSION_CATEGORIES
  const grouped = groupPermissionCategoriesForColumns(permissionCategories)

  const load = async () => {
    try {
      setLoading(true)
      const res = await adminApi<{ success?: boolean; data?: RoleRow[] }>("/role-definitions?limit=200")
      setRoles(Array.isArray(res.data) ? res.data : [])
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load roles")
      setRoles([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const openCreate = () => {
    setEditing(null)
    setForm({ name: "", slug: "", description: "", sortOrder: 100, isActive: true })
    setSelectedPerms([])
    setDialogOpen(true)
  }

  const openEdit = (r: RoleRow) => {
    setEditing(r)
    setForm({
      name: r.name,
      slug: r.slug,
      description: r.description ?? "",
      sortOrder: r.sortOrder,
      isActive: r.isActive,
    })
    setSelectedPerms([...r.defaultPermissions])
    setDialogOpen(true)
  }

  const togglePerm = (id: string) => {
    setSelectedPerms((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]))
  }

  const toggleCategory = (id: string) => {
    setExpanded((e) => (e.includes(id) ? e.filter((x) => x !== id) : [...e, id]))
  }

  const save = async () => {
    if (!form.name.trim()) {
      toast.error("Name is required")
      return
    }
    try {
      if (editing) {
        await adminApi(`/role-definitions/${editing.id}`, {
          method: "PATCH",
          body: {
            name: form.name.trim(),
            slug: editing.isSystem ? undefined : form.slug.trim(),
            description: form.description.trim() || null,
            defaultPermissions: selectedPerms,
            isActive: form.isActive,
            sortOrder: form.sortOrder,
          },
        })
        toast.success("Role updated")
      } else {
        await adminApi("/role-definitions", {
          method: "POST",
          body: {
            name: form.name.trim(),
            slug: form.slug.trim() || undefined,
            description: form.description.trim() || null,
            defaultPermissions: selectedPerms,
            isActive: form.isActive,
            sortOrder: form.sortOrder,
          },
        })
        toast.success("Role created")
      }
      setDialogOpen(false)
      void load()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed")
    }
  }

  const remove = async (r: RoleRow) => {
    if (r.isSystem) {
      toast.error("System roles cannot be deleted")
      return
    }
    if (!confirm(`Delete role "${r.name}"?`)) return
    try {
      await adminApi(`/role-definitions/${r.id}`, { method: "DELETE" })
      toast.success("Role deleted")
      void load()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Custom role templates</h1>
            <p className="text-gray-600">
              Define roles (e.g. Content Manager, Finance). Sub-admins pick a role and you can still tweak their
              permissions.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => void load()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={openCreate}>
              <Plus className="w-4 h-4 mr-2" />
              New role
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All roles</CardTitle>
            <CardDescription>Built-in roles are marked System and cannot be deleted.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Default permissions</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Loading…
                    </TableCell>
                  </TableRow>
                ) : roles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No roles found.
                    </TableCell>
                  </TableRow>
                ) : (
                  roles.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">
                        {r.name}
                        {r.isSystem && (
                          <Badge variant="secondary" className="ml-2">
                            System
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-1 rounded">{r.slug}</code>
                      </TableCell>
                      <TableCell>{r.defaultPermissions?.length ?? 0} items</TableCell>
                      <TableCell>
                        <Badge variant={r.isActive ? "default" : "secondary"}>
                          {r.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(r)} title="Edit">
                          <Pencil className="w-4 h-4" />
                        </Button>
                        {!r.isSystem && (
                          <Button variant="ghost" size="icon" onClick={() => void remove(r)} title="Delete">
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit role" : "New role"}</DialogTitle>
            <DialogDescription>
              Slug is used in the database (uppercase letters, numbers, underscores). Leave blank to generate from name.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Display name *</Label>
                <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Slug {editing?.isSystem ? "(system — locked)" : ""}</Label>
                <Input
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                  disabled={!!editing?.isSystem}
                  placeholder="e.g. CONTENT_MANAGER"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={2}
              />
            </div>
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
                <Checkbox
                  id="active"
                  checked={form.isActive}
                  onCheckedChange={(c) => setForm((f) => ({ ...f, isActive: c === true }))}
                />
                <Label htmlFor="active">Active</Label>
              </div>
            </div>

            <div>
              <Label className="mb-2 block">Default permissions (applied when choosing this role for a sub-admin)</Label>
              <div className="grid md:grid-cols-3 gap-4 border rounded-lg p-4 bg-muted/30">
                {grouped.map((column, i) => (
                  <div key={i} className="space-y-2">
                    {column.map((cat) => (
                      <div key={cat.id} className="border-b last:border-0 pb-2">
                        <button
                          type="button"
                          className="flex items-center gap-1 text-sm font-medium w-full text-left"
                          onClick={() => toggleCategory(cat.id)}
                        >
                          {expanded.includes(cat.id) ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                          {cat.title}
                        </button>
                        {expanded.includes(cat.id) && (
                          <div className="ml-5 mt-1 space-y-1">
                            {cat.subItems.map((s) => (
                              <div key={s.id} className="flex items-center gap-2">
                                <Checkbox
                                  id={`p-${s.id}`}
                                  checked={selectedPerms.includes(s.id)}
                                  onCheckedChange={() => togglePerm(s.id)}
                                />
                                <Label htmlFor={`p-${s.id}`} className="text-xs font-normal cursor-pointer">
                                  {s.title}
                                </Label>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
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
