"use client"

import { useCallback, useState } from "react"
import { Upload, X, Image as ImageIcon, Video, FileText } from "lucide-react"
import { Label } from "@/components/ui/label"
import { AppImage } from "@/components/app-image"
import { cn } from "@/lib/utils"
import { IMAGE_UPLOAD_HINT } from "@/lib/prepare-image-upload"

type AdminEventFileUploadProps = {
  label: string
  accept: string
  onFileUpload: (files: File[]) => void
  multiple?: boolean
  currentFiles?: string[]
  onFileRemove?: (index: number) => void
  error?: string
  className?: string
}

export function AdminEventFileUpload({
  label,
  accept,
  onFileUpload,
  multiple = false,
  currentFiles = [],
  onFileRemove,
  error,
  className,
}: AdminEventFileUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const inputId = `file-upload-${label.replace(/\s+/g, "-").toLowerCase()}`

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files?.length) return
      onFileUpload(Array.from(files))
    },
    [onFileUpload],
  )

  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-sm font-medium">{label}</Label>
      <div
        className={cn(
          "rounded-lg border-2 border-dashed p-4 text-center transition-colors cursor-pointer",
          dragActive ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/80",
          error && "border-red-400",
        )}
        onDrop={(e) => {
          e.preventDefault()
          setDragActive(false)
          handleFiles(e.dataTransfer.files)
        }}
        onDragOver={(e) => {
          e.preventDefault()
          setDragActive(true)
        }}
        onDragLeave={() => setDragActive(false)}
        onClick={() => document.getElementById(inputId)?.click()}
      >
        <Upload className="mx-auto mb-2 h-7 w-7 text-gray-400" />
        <p className="text-sm text-gray-600">Drag & drop or click to upload</p>
        <p className="mt-1 text-xs text-gray-500">
          {accept.includes("image")
            ? IMAGE_UPLOAD_HINT
            : accept.includes("video")
              ? "Video files"
              : "Documents — max 15 MB"}
        </p>
        <input
          id={inputId}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
      {currentFiles.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {currentFiles.map((file, index) => (
            <div
              key={`${file}-${index}`}
              className="flex max-w-full items-center gap-2 rounded-lg bg-gray-100 px-2 py-1.5 text-xs"
            >
              {file.includes("image") || accept.includes("image") ? (
                <ImageIcon className="h-3.5 w-3.5 shrink-0" />
              ) : file.includes("video") ? (
                <Video className="h-3.5 w-3.5 shrink-0" />
              ) : (
                <FileText className="h-3.5 w-3.5 shrink-0" />
              )}
              <span className="truncate">{file.split("/").pop()}</span>
              {onFileRemove ? (
                <button
                  type="button"
                  className="text-red-500 hover:text-red-700"
                  onClick={(e) => {
                    e.stopPropagation()
                    onFileRemove(index)
                  }}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function AdminEventImagePreview({
  src,
  onRemove,
  className,
}: {
  src: string
  onRemove: () => void
  className?: string
}) {
  return (
    <div className={cn("relative inline-block shrink-0", className)}>
      <AppImage
        src={src}
        alt="Preview"
        width={96}
        height={96}
        className="h-24 w-24 rounded-lg border object-cover"
        unoptimized={src.startsWith("blob:") || src.startsWith("data:")}
      />
      <button
        type="button"
        onClick={onRemove}
        className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white shadow hover:bg-red-600"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
