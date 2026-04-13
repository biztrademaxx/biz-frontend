import { ref, getDownloadURL, deleteObject, uploadBytesResumable, type UploadTaskSnapshot } from "firebase/storage"
import { storage } from "./firebase"

export interface UploadProgress {
  progress: number
  snapshot: UploadTaskSnapshot
}

export interface UploadResult {
  url: string
  path: string
  name: string
  size: number
  type: string
}

// Upload a single file
export const uploadFile = async (
  file: File,
  path: string,
  onProgress?: (progress: UploadProgress) => void,
): Promise<UploadResult> => {
  const fileName = `${Date.now()}-${file.name}`
  const filePath = `${path}/${fileName}`
  const storageRef = ref(storage, filePath)

  return new Promise((resolve, reject) => {
    const uploadTask = uploadBytesResumable(storageRef, file)

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        if (onProgress) {
          onProgress({ progress, snapshot })
        }
      },
      (error) => {
        console.error("Upload error:", error)
        reject(error)
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
          resolve({
            url: downloadURL,
            path: filePath,
            name: fileName,
            size: file.size,
            type: file.type,
          })
        } catch (error) {
          reject(error)
        }
      },
    )
  })
}

// Upload multiple files
export const uploadMultipleFiles = async (
  files: File[],
  path: string,
  onProgress?: (fileIndex: number, progress: UploadProgress) => void,
): Promise<UploadResult[]> => {
  const uploadPromises = files.map((file, index) =>
    uploadFile(file, path, (progress) => {
      if (onProgress) {
        onProgress(index, progress)
      }
    }),
  )

  return Promise.all(uploadPromises)
}

// Delete a file
export const deleteFile = async (filePath: string): Promise<void> => {
  const fileRef = ref(storage, filePath)
  await deleteObject(fileRef)
}

// Delete multiple files
export const deleteMultipleFiles = async (filePaths: string[]): Promise<void> => {
  const deletePromises = filePaths.map(deleteFile)
  await Promise.all(deletePromises)
}

// Validate file type
export const validateFileType = (file: File, allowedTypes: string[]): boolean => {
  return allowedTypes.some((type) => {
    if (type.endsWith("/*")) {
      return file.type.startsWith(type.slice(0, -1))
    }
    return file.type === type
  })
}

// Validate file size (in MB)
export const validateFileSize = (file: File, maxSizeMB: number): boolean => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  return file.size <= maxSizeBytes
}

// Get file extension
export const getFileExtension = (fileName: string): string => {
  return fileName.split(".").pop()?.toLowerCase() || ""
}

// Generate thumbnail for images (client-side)
export const generateThumbnail = (file: File, maxWidth = 300, maxHeight = 300): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("File is not an image"))
      return
    }

    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    const img = new Image()

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img

      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height
          height = maxHeight
        }
      }

      canvas.width = width
      canvas.height = height

      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height)
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error("Failed to generate thumbnail"))
          }
        },
        "image/jpeg",
        0.8,
      )
    }

    img.onerror = () => reject(new Error("Failed to load image"))
    img.src = URL.createObjectURL(file)
  })
}
