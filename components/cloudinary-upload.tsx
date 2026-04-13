"use client"

import { useState, useRef, useEffect } from "react"
import { X, Image as ImageIcon } from "lucide-react"
import { apiFetch } from "@/lib/api"

interface CloudinaryUploadProps {
  /** Called with Cloudinary `secure_url`; optional `publicId` for stored assets (e.g. blog extras). */
  onUploadComplete: (url: string, meta?: { publicId?: string }) => void
  currentImage?: string
  folder?: string
  /** Text on the drop zone when there is no image yet */
  emptyLabel?: string
  /** Text when an image is already selected */
  changeLabel?: string
  /** Applied to the preview <img> (default: small square) */
  previewClassName?: string
}

export default function CloudinaryUpload({
  onUploadComplete,
  currentImage,
  folder = "flags",
  emptyLabel = "Upload image",
  changeLabel = "Change image",
  previewClassName = "w-20 h-20 object-cover rounded-lg border border-gray-200",
}: CloudinaryUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImage || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setPreviewUrl(currentImage?.trim() ? currentImage.trim() : null)
  }, [currentImage])

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB')
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("folder", folder)

      const data = await apiFetch<{ success?: boolean; secure_url?: string; public_id?: string }>(
        "/api/admin/upload",
        {
          method: "POST",
          body: formData,
          auth: true,
        },
      )

      const url = data?.secure_url
      if (!url) throw new Error("Upload failed")
      setPreviewUrl(url)
      const publicId = data?.public_id?.trim()
      onUploadComplete(url, publicId ? { publicId } : undefined)
    } catch (error) {
      console.error("Upload error:", error)
      alert("Failed to upload image. Please try again.")
    } finally {
      setUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const removeImage = () => {
    setPreviewUrl(null)
    onUploadComplete("", undefined)
  }

  return (
    <div className="space-y-4">
      {/* Preview */}
      {previewUrl && (
        <div className="relative inline-block max-w-full">
          <img src={previewUrl} alt="" className={previewClassName} />
          <button
            type="button"
            onClick={removeImage}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors ${
          uploading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        onClick={() => !uploading && fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/*"
          className="hidden"
          disabled={uploading}
        />
        
        {uploading ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
            <p className="text-sm text-gray-600">Uploading...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
            <p className="text-sm font-medium text-gray-900 mb-1">
              {previewUrl ? changeLabel : emptyLabel}
            </p>
            <p className="text-xs text-gray-500">
              PNG, JPG, SVG up to 5MB
            </p>
          </div>
        )}
      </div>
    </div>
  )
}