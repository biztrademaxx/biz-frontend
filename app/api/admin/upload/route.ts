// app/api/admin/upload/route.ts
import { NextRequest, NextResponse } from "next/server"
import { uploadToCloudinary } from "@/lib/cloudinary"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const folder = formData.get('folder') as string || "speakers"

    console.log('Upload request received:', {
      fileName: file?.name,
      fileType: file?.type,
      fileSize: file?.size,
      folder
    })

    if (!file) {
      return NextResponse.json(
        { 
          success: false, 
          error: "No file provided",
          details: "Please select a file to upload"
        },
        { status: 400 }
      )
    }

    // Check if it's actually a File object
    if (!(file instanceof File)) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Invalid file object",
          details: `Expected File object, got ${typeof file}`
        },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Invalid file type",
          details: `File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`
        },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    const maxSize = 10 * 1024 * 1024 // 10MB

    if (file.size > maxSize) {
      return NextResponse.json(
        { 
          success: false, 
          error: "File too large",
          details: `File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds maximum size of 5MB`
        },
        { status: 400 }
      )
    }

    // Validate file size (min 1KB)
    if (file.size < 1024) {
      return NextResponse.json(
        { 
          success: false, 
          error: "File too small",
          details: "File appears to be empty or corrupted"
        },
        { status: 400 }
      )
    }

    console.log('Starting Cloudinary upload...')
    const uploadResult = await uploadToCloudinary(file, folder)
    console.log('Cloudinary upload successful:', uploadResult.public_id)

    return NextResponse.json({
      success: true,
      secure_url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
      format: uploadResult.format,
      bytes: uploadResult.bytes,
      message: "File uploaded successfully"
    })

  } catch (error) {
    console.error("Upload error:", error)
    
    // Handle specific Cloudinary errors
    if (error instanceof Error) {
      if (error.message.includes('File size too large')) {
        return NextResponse.json(
          { 
            success: false, 
            error: "File too large for Cloudinary",
            details: "Please try a smaller image"
          },
          { status: 400 }
        )
      }
      
      if (error.message.includes('Invalid image file')) {
        return NextResponse.json(
          { 
            success: false, 
            error: "Invalid image file",
            details: "The image file appears to be corrupted"
          },
          { status: 400 }
        )
      }
    }

    return NextResponse.json(
      { 
        success: false, 
        error: "Upload failed",
        details: error instanceof Error ? error.message : "Unknown error occurred"
      },
      { status: 500 }
    )
  }
}