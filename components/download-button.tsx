"use client"

import { getFileAsBase64 } from "@/app/actions/files"
import { incrementDownloadCount } from "@/app/actions/patterns"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { useToast } from "@/hooks/use-toast"
import { base64ToBlob, getContentType, getPathFromBlobUrl } from "@/lib/utils"
import type { User } from "@supabase/supabase-js"
import { Download } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

interface DownloadButtonProps {
  patternId: string
  fileUrl: string
  fileName: string
  user: User | null
}

export function DownloadButton({ patternId, fileUrl, fileName, user }: DownloadButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false)
  const { toast } = useToast()

  // Show login button for unauthenticated users
  if (!user) {
    return (
      <Button size="lg" className="w-full" asChild>
        <Link href="/auth/login">
          <Download className="mr-2 h-4 w-4" />
          Download Pattern
        </Link>
      </Button>
    )
  }

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
      link.remove();
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error("Download error:", err)
      const errorMessage = err instanceof Error ? err.message : "Download failed"

      if (errorMessage.includes("Unauthorized")) {
        toast({
          title: "Sign in required",
          description: "Please sign in to download patterns",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Download failed",
          description: errorMessage,
          variant: "destructive",
        })
      }
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
