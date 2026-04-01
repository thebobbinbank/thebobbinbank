"use client"

import { getFileAsBase64 } from "@/app/actions/files"
import { AvatarImage } from "@/components/ui/avatar"
import { getContentType, getPathFromBlobUrl } from "@/lib/utils"
import { useEffect, useState } from "react"

interface BlobAvatarImageProps {
    src?: string | null
}

/**
 * Avatar image component that loads private Vercel Blob files via server action
 */
export function BlobAvatarImage({ src }: BlobAvatarImageProps) {
    const [imageSrc, setImageSrc] = useState<string | undefined>(undefined)
    const [error, setError] = useState<boolean>(false)

    useEffect(() => {
        if (!src) {
            setImageSrc(undefined)
            return
        }

        let mounted = true

        const loadImage = async () => {
            try {
                // Check if it's a blob URL that needs loading
                if (!src.includes("blob.vercel")) {
                    // Not a blob URL, use as-is
                    setImageSrc(src)
                    return
                }

                // Get pathname from blob URL
                const pathname = getPathFromBlobUrl(src)

                // Fetch image as base64 from server action
                const base64 = await getFileAsBase64(pathname)

                // Convert to data URL
                const contentType = getContentType(pathname)
                const dataUrl = `data:${contentType};base64,${base64}`

                if (mounted) {
                    setImageSrc(dataUrl)
                    setError(false)
                }
            } catch (err) {
                console.error("Failed to load blob avatar image:", err)
                if (mounted) {
                    setError(true)
                    setImageSrc(undefined)
                }
            }
        }

        loadImage()

        return () => {
            mounted = false
        }
    }, [src])

    // Return undefined if no src or error to show fallback
    if (!imageSrc || error) {
        return null
    }

    return <AvatarImage src={imageSrc} />
}
