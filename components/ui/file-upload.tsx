"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Upload, X, ImageIcon, Video, File, Loader2 } from "lucide-react"
import {
  uploadFile,
  validateFileType,
  validateFileSize,
  type UploadResult,
  type UploadProgress,
} from "@/lib/firebase-storage"

interface FileUploadProps {
  onFilesUploaded: (files: UploadResult[]) => void
  onFilesRemoved?: (files: UploadResult[]) => void
  maxFiles?: number
  maxSizeMB?: number
  allowedTypes?: string[]
  uploadPath: string
  multiple?: boolean
  accept?: string
  className?: string
  disabled?: boolean
}

interface FileWithProgress extends File {
  id: string
  progress: number
  uploaded: boolean
  result?: UploadResult
  error?: string
}

export function FileUpload({
  onFilesUploaded,
  onFilesRemoved,
  maxFiles = 10,
  maxSizeMB = 10,
  allowedTypes = ["image/*", "video/*"],
  uploadPath,
  multiple = true,
  accept,
  className = "",
  disabled = false,
}: FileUploadProps) {
  const [files, setFiles] = useState<FileWithProgress[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const generateFileId = () => Math.random().toString(36).substr(2, 9)

  const validateFile = (file: File): string | null => {
    if (!validateFileType(file, allowedTypes)) {
      return `File type ${file.type} is not allowed`
    }
    if (!validateFileSize(file, maxSizeMB)) {
      return `File size exceeds ${maxSizeMB}MB limit`
    }
    return null
  }

  const handleFiles = useCallback(
    async (fileList: FileList) => {
      if (disabled) return

      const newFiles: FileWithProgress[] = []
      const validFiles: File[] = []

      // Validate files
      Array.from(fileList).forEach((file) => {
        const error = validateFile(file)
        const fileWithProgress: FileWithProgress = {
          ...file,
          id: generateFileId(),
          progress: 0,
          uploaded: false,
        //   error,
        }
        newFiles.push(fileWithProgress)
        if (!error) {
          validFiles.push(file)
        }
      })

      // Check total file count
      const totalFiles = files.length + newFiles.length
      if (totalFiles > maxFiles) {
        alert(`Maximum ${maxFiles} files allowed`)
        return
      }

      setFiles((prev) => [...prev, ...newFiles])

      if (validFiles.length === 0) return

      setIsUploading(true)

      try {
        const uploadResults: UploadResult[] = []

        // Upload files one by one to track individual progress
        for (let i = 0; i < validFiles.length; i++) {
          const file = validFiles[i]
          const fileWithProgress = newFiles.find((f) => f.name === file.name && !f.error)

          if (!fileWithProgress) continue

          try {
            const result = await uploadFile(file, uploadPath, (progress: UploadProgress) => {
              setFiles((prev) =>
                prev.map((f) => (f.id === fileWithProgress.id ? { ...f, progress: progress.progress } : f)),
              )
            })

            // Mark as uploaded
            setFiles((prev) => prev.map((f) => (f.id === fileWithProgress.id ? { ...f, uploaded: true, result } : f)))

            uploadResults.push(result)
          } catch (error) {
            console.error("Upload error:", error)
            setFiles((prev) => prev.map((f) => (f.id === fileWithProgress.id ? { ...f, error: "Upload failed" } : f)))
          }
        }

        if (uploadResults.length > 0) {
          onFilesUploaded(uploadResults)
        }
      } finally {
        setIsUploading(false)
      }
    },
    [files, maxFiles, uploadPath, onFilesUploaded, disabled, allowedTypes, maxSizeMB],
  )

  const removeFile = (fileId: string) => {
    const fileToRemove = files.find((f) => f.id === fileId)
    if (fileToRemove?.result && onFilesRemoved) {
      onFilesRemoved([fileToRemove.result])
    }
    setFiles((prev) => prev.filter((f) => f.id !== fileId))
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (!disabled && e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files)
    }
  }

  const getFileIcon = (file: FileWithProgress) => {
    if (file.type.startsWith("image/")) return <ImageIcon className="w-4 h-4" />
    if (file.type.startsWith("video/")) return <Video className="w-4 h-4" />
    return <File className="w-4 h-4" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"}
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-gray-400"}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-600 mb-2">
          {isDragging ? "Drop files here" : "Drag and drop files here, or click to browse"}
        </p>
        <p className="text-sm text-gray-500">
          Supports: {allowedTypes.join(", ")} • Max size: {maxSizeMB}MB • Max files: {maxFiles}
        </p>
        <Button
          variant="outline"
          className="mt-4 bg-transparent"
          disabled={disabled}
          onClick={(e:any) => e.stopPropagation()}
        >
          Choose Files
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        accept={accept || allowedTypes.join(",")}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium">
            Files ({files.length}/{maxFiles})
          </h4>
          {files.map((file) => (
            <Card key={file.id} className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1">
                  {getFileIcon(file)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {file.error && (
                      <Badge variant="destructive" className="text-xs">
                        Error
                      </Badge>
                    )}
                    {file.uploaded && (
                      <Badge variant="default" className="text-xs">
                        Uploaded
                      </Badge>
                    )}
                    {!file.uploaded && !file.error && file.progress > 0 && (
                      <div className="flex items-center space-x-2">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span className="text-xs">{Math.round(file.progress)}%</span>
                      </div>
                    )}
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => removeFile(file.id)} disabled={isUploading}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              {file.error && <p className="text-xs text-red-500 mt-1">{file.error}</p>}
              {!file.uploaded && !file.error && file.progress > 0 && (
                <Progress value={file.progress} className="mt-2" />
              )}
            </Card>
          ))}
        </div>
      )}

      {isUploading && (
        <div className="text-center">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
          <p className="text-sm text-gray-600">Uploading files...</p>
        </div>
      )}
    </div>
  )
}
