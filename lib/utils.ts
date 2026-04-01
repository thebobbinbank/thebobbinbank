import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Extracts the pathname from a Vercel Blob URL
 * Converts https://f5nbtcwcjwxxb66g.private.blob.vercel-storage.com/path/to/file
 * to /path/to/file
 */
export function getPathFromBlobUrl(url: string): string {
  try {
    const urlObj = new URL(url)
    return urlObj.pathname
  } catch {
    // If it's already a pathname or invalid URL, return as is
    return url
  }
}

/**
 * Converts base64-encoded data to a blob with the specified content type
 */
export function base64ToBlob(base64: string, contentType: string): Blob {
  const byteCharacters = atob(base64)
  const byteNumbers = new Array(byteCharacters.length)
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i)
  }
  const byteArray = new Uint8Array(byteNumbers)
  return new Blob([byteArray], { type: contentType })
}

/**
 * Converts base64-encoded data to a data URL
 */
export function base64ToDataUrl(base64: string, contentType: string): string {
  return `data:${contentType};base64,${base64}`
}

/**
 * Gets the content type based on file extension
 */
export function getContentType(pathname: string): string {
  const ext = pathname.split(".").pop()?.toLowerCase()

  const contentTypes: Record<string, string> = {
    pdf: "application/pdf",
    zip: "application/zip",
    svg: "image/svg+xml",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    webp: "image/webp",
    gif: "image/gif",
  }

  return contentTypes[ext || ""] || "application/octet-stream"
}
