import {
  IMAGE_UPLOAD_MAX_BYTES,
  IMAGE_UPLOAD_MAX_DIMENSION,
  IMAGE_UPLOAD_MAX_LABEL,
  IMAGE_UPLOAD_TARGET_BYTES,
  formatFileSize,
} from "@/lib/prepare-image-upload"

function isSvg(file: File): boolean {
  return file.type === "image/svg+xml" || /\.svg$/i.test(file.name)
}

function isRasterImage(file: File): boolean {
  if (file.type.startsWith("image/") && !isSvg(file)) return true
  return /\.(jpe?g|png|webp|gif|avif|bmp)$/i.test(file.name)
}

function outputName(original: string): string {
  return original.replace(/\.[^.]+$/, "") + ".jpg"
}

/**
 * Server-side safety net when the Next.js upload proxy receives an oversized image
 * (e.g. nginx 413 before Express). Uses sharp (already bundled with Next.js).
 */
export async function maybeCompressImageServer(file: File): Promise<File> {
  if (!isRasterImage(file)) {
    if (isSvg(file) && file.size > IMAGE_UPLOAD_MAX_BYTES) {
      throw new Error(`SVG must be under ${IMAGE_UPLOAD_MAX_LABEL} (yours: ${formatFileSize(file.size)}).`)
    }
    return file
  }

  if (file.size <= IMAGE_UPLOAD_TARGET_BYTES) {
    return file
  }

  const sharp = (await import("sharp")).default
  const input = Buffer.from(await file.arrayBuffer())

  const dimensions = [IMAGE_UPLOAD_MAX_DIMENSION, 1600, 1280, 1024, 800]
  const qualities = [85, 75, 65, 55, 45]

  let best: { buffer: Buffer; size: number } | null = null

  for (const dim of dimensions) {
    for (const quality of qualities) {
      const buffer = await sharp(input)
        .rotate()
        .resize(dim, dim, { fit: "inside", withoutEnlargement: true })
        .jpeg({ quality, mozjpeg: true })
        .toBuffer()

      if (buffer.length > IMAGE_UPLOAD_MAX_BYTES) continue
      if (!best || buffer.length < best.size) best = { buffer, size: buffer.length }
      if (buffer.length <= IMAGE_UPLOAD_TARGET_BYTES) {
        return new File([new Uint8Array(buffer)], outputName(file.name), {
          type: "image/jpeg",
        })
      }
    }
  }

  if (best) {
    return new File([new Uint8Array(best.buffer)], outputName(file.name), {
      type: "image/jpeg",
    })
  }

  throw new Error(
    `Image is too large (${formatFileSize(file.size)}). Maximum upload size is ${IMAGE_UPLOAD_MAX_LABEL} per image.`,
  )
}
