"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ChevronDown, ChevronRight, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"
import { adminApi } from "@/lib/admin-api"
import { AuthErrorHandler } from "./auth-error-handler"
import { ADMIN_PERMISSION_CATEGORIES, groupPermissionCategoriesForColumns } from "./permission-categories"

interface SubAdminEditPageProps {
  subAdmin: {
    id: string
    name: string
    email: string
    phone?: string
    role: string
    roleDisplayName?: string
    permissions: string[]
    isActive: boolean
  }
  onSuccess?: () => void
  onCancel?: () => void
}

type RoleTemplate = {
  slug: string
  name: string
  defaultPermissions: string[]
}

export default function SubAdminEditPage({ subAdmin, onSuccess, onCancel }: SubAdminEditPageProps) {
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
  const [expandedCategories, setExpandedCategories] = useState<string[]>([])
  const [roleTemplates, setRoleTemplates] = useState<RoleTemplate[]>([])
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [authError, setAuthError] = useState<Error | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "SUB_ADMIN",
    isActive: true,
    password: "",
    confirmPassword: "",
  })

  useEffect(() => {
    setFormData({
      name: subAdmin.name,
      email: subAdmin.email,
      phone: subAdmin.phone || "",
      role: subAdmin.role,
      isActive: subAdmin.isActive,
      password: "",
      confirmPassword: "",
    })
    setSelectedPermissions(subAdmin.permissions)
  }, [subAdmin])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await adminApi<{ success?: boolean; data?: RoleTemplate[] }>(
          "/role-definitions?active=true&limit=100",
        )
        const rows = Array.isArray(res.data) ? res.data : []
        if (!cancelled) setRoleTemplates(rows)
      } catch {
        if (!cancelled) {
          setRoleTemplates([
            { slug: "SUB_ADMIN", name: "Sub Admin", defaultPermissions: [] },
            { slug: "MODERATOR", name: "Moderator", defaultPermissions: [] },
            { slug: "SUPPORT", name: "Support Staff", defaultPermissions: [] },
          ])
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const handleToggle = (perm: string) => {
    setSelectedPermissions((prev) => 
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    )
  }

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId],
    )
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleRoleChange = (role: string) => {
    setFormData((prev) => ({ ...prev, role }))
    const tpl = roleTemplates.find((r) => r.slug === role)
    if (tpl?.defaultPermissions?.length) {
      setSelectedPermissions([...tpl.defaultPermissions])
    } else {
      setSelectedPermissions([])
    }
  }

  const validateForm = () => {
    if (!formData.name || !formData.email || selectedPermissions.length === 0) {
      toast.error("Please fill all required fields and select at least one permission")
      return false
    }

    // If password is provided, validate it
    if (formData.password) {
      if (formData.password.length < 6) {
        toast.error("Password must be at least 6 characters long")
        return false
      }

      if (formData.password !== formData.confirmPassword) {
        toast.error("Passwords do not match")
        return false
      }
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)
    setAuthError(null)

    try {
      // Prepare update data
      const updateData: any = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        isActive: formData.isActive,
        permissions: selectedPermissions,
      }

      // Only include password if it's provided
      if (formData.password) {
        updateData.password = formData.password
      }

      await adminApi(`/sub-admins/${subAdmin.id}`, {
        method: "PATCH",
        body: updateData,
      })

      toast.success("Sub-admin updated successfully")
      
      if (onSuccess && typeof onSuccess === 'function') {
        onSuccess()
      }
    } catch (error) {
      console.error("Error updating sub-admin:", error)
      if (error instanceof Error) {
        if (error.message.includes("Authentication failed")) {
          setAuthError(error)
        } else {
          toast.error(error.message)
        }
      } else {
        toast.error("Failed to update sub-admin")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    if (onCancel && typeof onCancel === 'function') {
      onCancel()
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword)
  }

  const permissionCategories = ADMIN_PERMISSION_CATEGORIES
  const groupedCategories = groupPermissionCategoriesForColumns(permissionCategories)

  if (authError) {
    return <AuthErrorHandler error={authError} />
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="relative flex items-center justify-center w-full mb-6">
          <div className="w-full h-[4px] rounded-full bg-gradient-to-r from-green-300 to-blue-500" />
          <div className="absolute">
            <div className="bg-blue-500 text-white font-semibold text-sm px-4 py-2 rounded-md shadow">
              EDIT SUB ADMIN
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-gray-800 pb-5">Edit sub admin details</CardTitle>
          </CardHeader>
          <hr />
          <CardContent className="space-y-5">
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 pt-3">
                <div className="grid grid-cols-12 items-center gap-3">
                  <Label className="col-span-2 text-gray-700 font-medium">Sub admin name *</Label>
                  <Input
                    className="col-span-9"
                    placeholder="Name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    required
                  />
                </div>
                <hr />

                <div className="grid grid-cols-12 items-center gap-3">
                  <Label className="col-span-2 text-gray-700 font-medium">Email *</Label>
                  <Input
                    className="col-span-9"
                    placeholder="Enter email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                  />
                </div>
                <hr />

                <div className="grid grid-cols-12 items-center gap-3">
                  <Label className="col-span-2 text-gray-700 font-medium">Phone</Label>
                  <Input
                    className="col-span-9"
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                  />
                </div>
                <hr />

                {/* Password Update Section */}
                <div className="grid grid-cols-12 items-center gap-3">
                  <Label className="col-span-2 text-gray-700 font-medium">New Password</Label>
                  <div className="col-span-9 relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Leave blank to keep current password"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <hr />

                {formData.password && (
                  <>
                    <div className="grid grid-cols-12 items-center gap-3">
                      <Label className="col-span-2 text-gray-700 font-medium">Confirm Password</Label>
                      <div className="col-span-9 relative">
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm new password"
                          value={formData.confirmPassword}
                          onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={toggleConfirmPasswordVisibility}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <hr />
                  </>
                )}

                <div className="grid grid-cols-12 items-start gap-3">
                  <Label className="col-span-2 text-gray-700 font-medium pt-2">Role *</Label>
                  <div className="col-span-9 flex flex-wrap gap-x-4 gap-y-2">
                    {roleTemplates.length === 0 ? (
                      <span className="text-sm text-muted-foreground">Loading roles…</span>
                    ) : (
                      roleTemplates.map((roleOption) => (
                        <div key={roleOption.slug} className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id={`role-${roleOption.slug}`}
                            name="role"
                            value={roleOption.slug}
                            checked={formData.role === roleOption.slug}
                            onChange={(e) => handleRoleChange(e.target.value)}
                            className="h-4 w-4 text-blue-500 border-gray-300 focus:ring-blue-500"
                          />
                          <Label htmlFor={`role-${roleOption.slug}`} className="text-gray-700 cursor-pointer">
                            {roleOption.name}
                          </Label>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                <hr />

                <div className="grid grid-cols-12 items-center gap-3">
                  <Label className="col-span-2 text-gray-700 font-medium">Status</Label>
                  <div className="col-span-9 flex gap-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="status-active"
                        name="status"
                        value="active"
                        checked={formData.isActive}
                        onChange={() => handleInputChange("isActive", true)}
                        className="h-4 w-4 text-green-500 border-gray-300 focus:ring-green-500"
                      />
                      <Label htmlFor="status-active" className="text-gray-700 cursor-pointer">
                        Active
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="status-inactive"
                        name="status"
                        value="inactive"
                        checked={!formData.isActive}
                        onChange={() => handleInputChange("isActive", false)}
                        className="h-4 w-4 text-red-500 border-gray-300 focus:ring-red-500"
                      />
                      <Label htmlFor="status-inactive" className="text-gray-700 cursor-pointer">
                        Inactive
                      </Label>
                    </div>
                  </div>
                </div>
              </div>
              <hr className="mt-3"/>

              <div className="mt-5">
                <Label className="block mb-3 font-medium text-gray-700">Permissions *</Label>

                <div className="grid md:grid-cols-3 gap-6">
                  {groupedCategories.map((column, columnIndex) => (
                    <div key={columnIndex} className="space-y-3">
                      {column.map((category) => (
                        <div key={category.id} className="border-b last:border-none pb-3">
                          <div
                            className="flex items-center space-x-2 cursor-pointer p-2 rounded hover:bg-gray-50"
                            onClick={() => toggleCategory(category.id)}
                          >
                            {expandedCategories.includes(category.id) ? (
                              <ChevronDown className="h-4 w-4 text-gray-500" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-gray-500" />
                            )}
                            <Checkbox
                              id={`category-${category.id}`}
                              checked={category.subItems.every((subItem) => selectedPermissions.includes(subItem.id))}
                              onCheckedChange={() => {
                                const allSubItemIds = category.subItems.map((sub) => sub.id)
                                if (category.subItems.every((subItem) => selectedPermissions.includes(subItem.id))) {
                                  setSelectedPermissions((prev) => prev.filter((p) => !allSubItemIds.includes(p)))
                                } else {
                                  setSelectedPermissions((prev) => [
                                    ...prev,
                                    ...allSubItemIds.filter((p) => !prev.includes(p)),
                                  ])
                                }
                              }}
                              className={`transition-colors duration-200 
                                ${
                                  category.subItems.every((subItem) =>
                                    selectedPermissions.includes(subItem.id),
                                  )
                                    ? "data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                                    : "bg-white border-gray-300"
                                }`}
                            />
                            <Label
                              htmlFor={`category-${category.id}`}
                              className="text-gray-700 font-medium cursor-pointer"
                            >
                              {category.title}
                            </Label>
                          </div>

                          {expandedCategories.includes(category.id) && (
                            <div className="ml-6 mt-2 space-y-2">
                              {category.subItems.map((subItem) => (
                                <div
                                  key={subItem.id}
                                  className="flex items-center space-x-2 p-1 rounded hover:bg-gray-50"
                                >
                                  <Checkbox
                                    id={subItem.id}
                                    checked={selectedPermissions.includes(subItem.id)}
                                    onCheckedChange={() => handleToggle(subItem.id)}
                                    className={`transition-colors duration-200 
                                      ${
                                        selectedPermissions.includes(subItem.id)
                                          ? "data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                                          : "bg-white border-gray-300"
                                      }`}
                                  />
                                  <Label htmlFor={subItem.id} className="text-gray-600 text-sm">
                                    {subItem.title}
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

              <div className="flex justify-start gap-4 pt-6">
                <Button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white" disabled={loading}>
                  {loading ? "Updating..." : "Update User"}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel} disabled={loading}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}