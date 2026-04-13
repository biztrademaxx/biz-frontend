"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Upload, X, Loader2, FileText, Image as ImageIcon } from "lucide-react"
import Image from "next/image"
import type { EventFormData } from "./types"
import type { RefObject } from "react"
import { useState } from "react"

export interface MediaTabProps {
  formData: EventFormData
  isUploadingImages: boolean
  isUploadingBrochure: boolean
  isUploadingLayoutPlan: boolean
  fileInputRef: RefObject<HTMLInputElement | null>
  brochureInputRef: RefObject<HTMLInputElement | null>
  layoutPlanInputRef: RefObject<HTMLInputElement | null>
  onFormChange: (updates: Partial<EventFormData>) => void
  onRemoveImage: (index: number) => void
  onUploadStatusChange: (type: 'images' | 'brochure' | 'layout', status: boolean) => void
}

export function MediaTab({
  formData,
  isUploadingImages,
  isUploadingBrochure,
  isUploadingLayoutPlan,
  fileInputRef,
  brochureInputRef,
  layoutPlanInputRef,
  onFormChange,
  onRemoveImage,
  onUploadStatusChange,
}: MediaTabProps) {
  const [uploadProgress, setUploadProgress] = useState<number>(0)

  // Backend upload function
  const uploadToBackend = async (file: File, type: 'image' | 'document'): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type)

    try {
      const response = await fetch('/api/upload2', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const data = await response.json()
      return data.url
    } catch (error) {
      console.error('Upload error:', error)
      throw new Error(error instanceof Error ? error.message : 'Failed to upload file')
    }
  }

  // Handle image upload
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    onUploadStatusChange('images', true)
    setUploadProgress(0)

    try {
      const uploadedUrls: string[] = []
      const totalFiles = files.length

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        
        // Update progress
        setUploadProgress(Math.round(((i + 1) / totalFiles) * 100))
        
        if (file.type.startsWith('image/')) {
          try {
            const url = await uploadToBackend(file, 'image')
            uploadedUrls.push(url)
          } catch (error) {
            console.error(`Failed to upload image ${i + 1}:`, error)
            // Continue with other images even if one fails
          }
        }
      }

      if (uploadedUrls.length > 0) {
        // Add new images to existing ones
        onFormChange({
          images: [...formData.images, ...uploadedUrls]
        })
        alert(`Successfully uploaded ${uploadedUrls.length} image(s)`)
      }

      setUploadProgress(0)
    } catch (error) {
      console.error('Error uploading images:', error)
      alert('Failed to upload some images. Please try again.')
    } finally {
      onUploadStatusChange('images', false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // Handle brochure upload
  const handleBrochureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    onUploadStatusChange('brochure', true)
    setUploadProgress(50)

    try {
      const file = files[0]
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        const url = await uploadToBackend(file, 'document')
        onFormChange({ brochure: url })
        setUploadProgress(100)
        alert('Brochure uploaded successfully!')
      } else {
        alert('Please upload a PDF file for the brochure')
      }
    } catch (error) {
      console.error('Error uploading brochure:', error)
      alert('Failed to upload brochure. Please try again.')
    } finally {
      onUploadStatusChange('brochure', false)
      setUploadProgress(0)
      if (brochureInputRef.current) {
        brochureInputRef.current.value = ''
      }
    }
  }

  // Handle layout plan upload
  const handleLayoutPlanUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    onUploadStatusChange('layout', true)
    setUploadProgress(50)

    try {
      const file = files[0]
      // Accept both images and PDFs for layout plans
      if (file.type.startsWith('image/') || file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        const url = await uploadToBackend(file, 'document')
        onFormChange({ layoutPlan: url })
        setUploadProgress(100)
        alert('Layout plan uploaded successfully!')
      } else {
        alert('Please upload an image or PDF file for the layout plan')
      }
    } catch (error) {
      console.error('Error uploading layout plan:', error)
      alert('Failed to upload layout plan. Please try again.')
    } finally {
      onUploadStatusChange('layout', false)
      setUploadProgress(0)
      if (layoutPlanInputRef.current) {
        layoutPlanInputRef.current.value = ''
      }
    }
  }

  // Remove brochure
  const handleRemoveBrochure = () => {
    onFormChange({ brochure: "" })
  }

  // Remove layout plan
  const handleRemoveLayoutPlan = () => {
    onFormChange({ layoutPlan: "" })
  }

  return (
    <div className="space-y-6">
      {/* Hidden file inputs */}
      <input 
        type="file" 
        ref={fileInputRef} 
        accept="image/*" 
        multiple 
        className="hidden" 
        onChange={handleImageUpload}
        disabled={isUploadingImages}
      />
      <input
        type="file"
        ref={brochureInputRef}
        accept=".pdf"
        className="hidden"
        onChange={handleBrochureUpload}
        disabled={isUploadingBrochure}
      />
      <input
        type="file"
        ref={layoutPlanInputRef}
        accept=".pdf,.jpg,.jpeg,.png"
        className="hidden"
        onChange={handleLayoutPlanUpload}
        disabled={isUploadingLayoutPlan}
      />

      {/* Event Images Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Event Images
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Upload high-quality images for your event. Supported formats: JPG, PNG, WebP
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            className={`border-2 border-dashed border-gray-300 rounded-lg p-8 text-center ${
              isUploadingImages ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-gray-400"
            } transition-colors`}
            onClick={() => !isUploadingImages && fileInputRef.current?.click()}
          >
            {isUploadingImages ? (
              <>
                <Loader2 className="w-12 h-12 mx-auto text-gray-400 mb-4 animate-spin" />
                <p className="text-gray-600 mb-2">Uploading images... {uploadProgress}%</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </>
            ) : (
              <>
                <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 mb-2">Drag and drop images here, or click to browse</p>
                <p className="text-sm text-gray-500 mb-4">Recommended: 1200x800px or larger</p>
                <Button
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

          {formData.images.length > 0 && (
            <div>
              <Label className="text-sm font-medium mb-2 block">
                Uploaded Images ({formData.images.length})
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {formData.images.map((image, index) => (
                  <div key={index} className="relative group">
                    <Image
                      src={image || "/placeholder.svg"}
                      alt={`Event image ${index + 1}`}
                      width={200}
                      height={150}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => onRemoveImage(index)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b-lg">
                      Image {index + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Documents Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Event Documents
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Upload brochures and layout plans for your event
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Brochure Upload */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="brochure" className="text-base">Event Brochure</Label>
              {formData.brochure && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveBrochure}
                  disabled={isUploadingBrochure}
                >
                  <X className="w-4 h-4 mr-1" />
                  Remove
                </Button>
              )}
            </div>
            
            {formData.brochure ? (
              <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-green-600" />
                  <div className="flex-1">
                    <p className="font-medium text-green-800">Brochure uploaded successfully</p>
                    <p className="text-sm text-green-600 truncate">
                      {formData.brochure.split('/').pop()}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(formData.brochure, '_blank')}
                  >
                    View
                  </Button>
                </div>
              </div>
            ) : (
              <div
                className={`border-2 border-dashed border-gray-300 rounded-lg p-6 text-center ${
                  isUploadingBrochure ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-gray-400"
                } transition-colors`}
                onClick={() => !isUploadingBrochure && brochureInputRef.current?.click()}
              >
                {isUploadingBrochure ? (
                  <>
                    <Loader2 className="w-8 h-8 mx-auto text-gray-400 mb-2 animate-spin" />
                    <p className="text-gray-600">Uploading brochure... {uploadProgress}%</p>
                  </>
                ) : (
                  <>
                    <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-600 mb-1">Click to upload event brochure</p>
                    <p className="text-sm text-gray-500">PDF format only</p>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Layout Plan Upload */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="layoutPlan" className="text-base">Layout Plan</Label>
              {formData.layoutPlan && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveLayoutPlan}
                  disabled={isUploadingLayoutPlan}
                >
                  <X className="w-4 h-4 mr-1" />
                  Remove
                </Button>
              )}
            </div>
            
            {formData.layoutPlan ? (
              <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <ImageIcon className="w-8 h-8 text-green-600" />
                  <div className="flex-1">
                    <p className="font-medium text-green-800">Layout plan uploaded successfully</p>
                    <p className="text-sm text-green-600 truncate">
                      {formData.layoutPlan.split('/').pop()}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(formData.layoutPlan, '_blank')}
                  >
                    View
                  </Button>
                </div>
              </div>
            ) : (
              <div
                className={`border-2 border-dashed border-gray-300 rounded-lg p-6 text-center ${
                  isUploadingLayoutPlan ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-gray-400"
                } transition-colors`}
                onClick={() => !isUploadingLayoutPlan && layoutPlanInputRef.current?.click()}
              >
                {isUploadingLayoutPlan ? (
                  <>
                    <Loader2 className="w-8 h-8 mx-auto text-gray-400 mb-2 animate-spin" />
                    <p className="text-gray-600">Uploading layout plan... {uploadProgress}%</p>
                  </>
                ) : (
                  <>
                    <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-600 mb-1">Click to upload layout plan</p>
                    <p className="text-sm text-gray-500">PDF, JPG, or PNG format</p>
                  </>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Upload Guidelines */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <h4 className="font-medium text-blue-900 mb-2">Upload Guidelines</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Images: Maximum 10MB per image, recommended size 1200x800px</li>
            <li>• Brochure: PDF format only, maximum 20MB</li>
            <li>• Layout Plan: PDF, JPG, or PNG format, maximum 20MB</li>
            <li>• All files are securely stored in Cloudinary</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}