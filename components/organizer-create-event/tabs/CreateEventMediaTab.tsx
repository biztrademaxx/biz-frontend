"use client"

import type React from "react"
import Image from "next/image"
import { Loader2, Upload, X } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import type { EventFormData } from "../types"

export type CreateEventMediaTabProps = {
  formData: EventFormData
  setFormData: React.Dispatch<React.SetStateAction<EventFormData>>
  fileInputRef: React.RefObject<HTMLInputElement | null>
  brochureInputRef: React.RefObject<HTMLInputElement | null>
  layoutPlanInputRef: React.RefObject<HTMLInputElement | null>
  isUploadingImages: boolean
  isUploadingBrochure: boolean
  isUploadingLayoutPlan: boolean
  showValidationErrors: boolean
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleBrochureUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleLayoutPlanUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function CreateEventMediaTab({
  formData,
  setFormData,
  fileInputRef,
  brochureInputRef,
  layoutPlanInputRef,
  isUploadingImages,
  isUploadingBrochure,
  isUploadingLayoutPlan,
  showValidationErrors,
  handleImageUpload,
  handleBrochureUpload,
  handleLayoutPlanUpload,
}: CreateEventMediaTabProps) {
  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        multiple
        className="hidden"
        disabled={isUploadingImages}
      />
      <input
        type="file"
        ref={brochureInputRef}
        onChange={handleBrochureUpload}
        accept=".pdf,.doc,.docx"
        className="hidden"
        disabled={isUploadingBrochure}
      />
      <input
        type="file"
        ref={layoutPlanInputRef}
        onChange={handleLayoutPlanUpload}
        accept=".pdf,.jpg,.jpeg,.png"
        className="hidden"
        disabled={isUploadingLayoutPlan}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Event Images *
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Upload at least one image for your event (maximum 10 images)
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            className={`border-2 border-dashed border-gray-300 rounded-lg p-8 text-center ${isUploadingImages ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-gray-400"
              } transition-colors ${showValidationErrors && formData.images.length === 0 ? "border-red-500" : ""}`}
            onClick={() => !isUploadingImages && fileInputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                if (!isUploadingImages) fileInputRef.current?.click()
              }
            }}
            role="button"
            tabIndex={0}
          >
            {isUploadingImages ? (
              <>
                <Loader2 className="w-12 h-12 mx-auto text-gray-400 mb-4 animate-spin" />
                <p className="text-gray-600 mb-2">Uploading images...</p>
              </>
            ) : (
              <>
                <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 mb-2">Drag and drop images here, or click to browse</p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation()
                    fileInputRef.current?.click()
                  }}
                >
                  Choose Images
                </Button>
              </>
            )}
          </div>

          {showValidationErrors && formData.images.length === 0 && (
            <p className="text-sm text-red-500 text-center">At least one event image is required</p>
          )}

          {formData.images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {formData.images.map((image, index) => (
                <div key={index} className="relative group">
                  <Image
                    src={image}
                    alt={`Event image ${index + 1}`}
                    width={200}
                    height={150}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        images: prev.images.filter((_, i) => i !== index),
                      }))
                    }
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Documents *</CardTitle>
          <p className="text-sm text-muted-foreground">
            Both brochure and layout plan are required
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="brochure">Event Brochure *</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="brochure"
                value={formData.brochure ? formData.brochure.split("/").pop() || "Uploaded" : ""}
                placeholder={isUploadingBrochure ? "Uploading..." : "No file selected"}
                readOnly
                className={showValidationErrors && !formData.brochure ? "border-red-500" : ""}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => brochureInputRef.current?.click()}
                disabled={isUploadingBrochure}
              >
                {isUploadingBrochure ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              </Button>
            </div>
            {showValidationErrors && !formData.brochure && (
              <p className="text-sm text-red-500 mt-1">Brochure is required</p>
            )}
            {formData.brochure && <p className="text-xs text-green-600 mt-1">✓ Brochure uploaded successfully</p>}
          </div>

          <div>
            <Label htmlFor="layoutPlan">Layout Plan *</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="layoutPlan"
                value={formData.layoutPlan ? formData.layoutPlan.split("/").pop() || "Uploaded" : ""}
                placeholder={isUploadingLayoutPlan ? "Uploading..." : "No file selected"}
                readOnly
                className={showValidationErrors && !formData.layoutPlan ? "border-red-500" : ""}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => layoutPlanInputRef.current?.click()}
                disabled={isUploadingLayoutPlan}
              >
                {isUploadingLayoutPlan ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
              </Button>
            </div>
            {showValidationErrors && !formData.layoutPlan && (
              <p className="text-sm text-red-500 mt-1">Layout plan is required</p>
            )}
            {formData.layoutPlan && (
              <p className="text-xs text-green-600 mt-1">✓ Layout plan uploaded successfully</p>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  )
}