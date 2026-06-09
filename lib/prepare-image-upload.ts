/** Nginx on production often limits request bodies to ~1 MB — stay under that after compression. */
export const IMAGE_UPLOAD_MAX_BYTES = 1024 * 1024
export const IMAGE_UPLOAD_MAX_LABEL = "1 MB"
export const IMAGE_UPLOAD_TARGET_BYTES = Math.floor(IMAGE_UPLOAD_MAX_BYTES * 0.9)
export const IMAGE_UPLOAD_MAX_DIMENSION = 1920
export const IMAGE_UPLOAD_MAX_ORIGINAL_BYTES = 30 * 1024 * 1024

export const IMAGE_UPLOAD_FORMATS_LABEL = "JPEG, PNG, WebP, GIF, or AVIF"
export const IMAGE_UPLOAD_HINT = `Max ${IMAGE_UPLOAD_MAX_LABEL} per image (auto-compressed). ${IMAGE_UPLOAD_FORMATS_LABEL}.`

export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "0 B"
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

function isSvgFile(file: File): boolean {
  return file.type === "image/svg+xml" || /\.svg$/i.test(file.name)
}

function isRasterImage(file: File): boolean {
  if (file.type.startsWith("image/") && file.type !== "image/svg+xml") return true
  return /\.(jpe?g|png|webp|gif|avif|bmp)$/i.test(file.name)
}

function outputName(original: string, mime: string): string {
  const base = original.replace(/\.[^.]+$/, "") || "upload"
  if (mime === "image/webp") return `${base}.webp`
  if (mime === "image/png") return `${base}.png`
  return `${base}.jpg`
}

async function loadImageElement(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error("Could not read image file"))
    }
    img.src = url
  })
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Image compression failed"))),
      type,
      quality,
    )
  })
}

async function compressWithCanvas(
  file: File,
  maxDimension: number,
  mime: string,
  quality: number,
): Promise<Blob> {
  const img = await loadImageElement(file)
  let { width, height } = img
  const scale = Math.min(1, maxDimension / Math.max(width, height))
  width = Math.max(1, Math.round(width * scale))
  height = Math.max(1, Math.round(height * scale))

  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Canvas is not available")
  ctx.drawImage(img, 0, 0, width, height)
  return canvasToBlob(canvas, mime, quality)
}

async function compressRasterImage(file: File): Promise<File> {
  const attempts: Array<{ maxDim: number; mime: string; quality: number }> = []
  for (const maxDim of [IMAGE_UPLOAD_MAX_DIMENSION, 1600, 1280, 1024, 800]) {
    for (const quality of [0.85, 0.75, 0.65, 0.55, 0.45]) {
      attempts.push({ maxDim, mime: "image/jpeg", quality })
      attempts.push({ maxDim, mime: "image/webp", quality })
    }
  }

  let best: File | null = null
  for (const { maxDim, mime, quality } of attempts) {
    try {
      const blob = await compressWithCanvas(file, maxDim, mime, quality)
      if (blob.size > IMAGE_UPLOAD_MAX_BYTES) continue
      const next = new File([blob], outputName(file.name, mime), {
        type: mime,
        lastModified: Date.now(),
      })
      if (!best || next.size < best.size) best = next
      if (next.size <= IMAGE_UPLOAD_TARGET_BYTES) return next
    } catch {
      /* try next attempt */
    }
  }

  if (best) return best

  throw new Error(
    `Could not compress image below ${IMAGE_UPLOAD_MAX_LABEL}. Try a smaller photo (current: ${formatFileSize(file.size)}).`,
  )
}

/**
 * Resize/compress raster images before upload. SVG is passed through if under the limit.
 */
export async function prepareImageFileForUpload(file: File): Promise<File> {
  if (typeof window === "undefined") return file

  if (file.size > IMAGE_UPLOAD_MAX_ORIGINAL_BYTES) {
    throw new Error(
      `Image is too large (${formatFileSize(file.size)}). Pick a file under ${formatFileSize(IMAGE_UPLOAD_MAX_ORIGINAL_BYTES)}.`,
    )
  }

  if (isSvgFile(file)) {
    if (file.size > IMAGE_UPLOAD_MAX_BYTES) {
      throw new Error(`SVG must be under ${IMAGE_UPLOAD_MAX_LABEL} (yours: ${formatFileSize(file.size)}).`)
    }
    return file
  }

  if (!isRasterImage(file)) {
    return file
  }

  if (file.size <= IMAGE_UPLOAD_TARGET_BYTES) {
    return file
  }

  return compressRasterImage(file)
}

export function parseUploadErrorMessage(status: number, raw: string): string {
  if (status === 413 || raw.includes("413") || /too large/i.test(raw)) {
    return `File is too large. Maximum upload size is ${IMAGE_UPLOAD_MAX_LABEL} per image.`
  }
  if (raw.trim().startsWith("<")) {
    return `Upload failed (${status}). The file may be too large — max ${IMAGE_UPLOAD_MAX_LABEL} per image.`
  }
  return raw.trim().slice(0, 300) || `Upload failed (${status})`
}
