"use client"

import { getFileAsBase64 } from "@/app/actions/files"
import { incrementDownloadCount } from "@/app/actions/patterns"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { base64ToBlob, getContentType, getPathFromBlobUrl } from "@/lib/utils"
import { Download } from "lucide-react"
import { useState } from "react"

interface DownloadButtonProps {
  patternId: string
  fileUrl: string
  fileName: string
}

export function DownloadButton({ patternId, fileUrl, fileName }: DownloadButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = async () => {
    setIsDownloading(true)

    try {
      // Increment download count
      await incrementDownloadCount(patternId)

      // Get pathname from file URL
      const pathname = getPathFromBlobUrl(fileUrl)

      // Fetch file as base64 from server action
      const base64 = await getFileAsBase64(pathname)

      // Convert base64 to blob
      const contentType = getContentType(pathname)
      const blob = base64ToBlob(base64, contentType)

      // Trigger download
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error("Download error:", err)
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <Button
      size="lg"
      className="w-full"
      onClick={handleDownload}
      disabled={isDownloading}
    >
      {isDownloading ? (
        <Spinner className="mr-2" />
      ) : (
        <Download className="mr-2 h-4 w-4" />
      )}
      Download Pattern
    </Button>
  )
}
