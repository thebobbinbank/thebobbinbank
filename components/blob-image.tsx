"use client"

import { getFileAsBase64 } from "@/app/actions/files"
import { base64ToDataUrl, getContentType, getPathFromBlobUrl } from "@/lib/utils"
import Image from "next/image"
import { useEffect, useState } from "react"

interface BlobImageProps {
    src: string
    alt: string
    fill?: boolean
    className?: string
    priority?: boolean
    width?: number
    height?: number
}

/**
 * Image component that loads private Vercel Blob files via server action
 */
export function BlobImage({
    src,
    alt,
    fill = false,
    className = "",
    priority = false,
    width,
    height,
}: BlobImageProps) {
    const [imageSrc, setImageSrc] = useState<string | null>(null)
    const [error, setError] = useState<boolean>(false)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        let mounted = true

        const loadImage = async () => {
            try {
                setIsLoading(true)
                // Get pathname from blob URL
                const pathname = getPathFromBlobUrl(src)

                // Fetch image as base64 from server action
                const base64 = await getFileAsBase64(pathname)

                // Convert to data URL
                const contentType = getContentType(pathname)
                const dataUrl = base64ToDataUrl(base64, contentType)

                if (mounted) {
                    setImageSrc(dataUrl)
                    setError(false)
                }
            } catch (err) {
                console.error("Failed to load blob image:", err)
                if (mounted) {
                    setError(true)
                }
            } finally {
                if (mounted) {
                    setIsLoading(false)
                }
            }
        }

        loadImage()

        return () => {
            mounted = false
        }
    }, [src])

    // Show nothing while loading
    if (isLoading) {
        return <div className={`bg-muted animate-pulse ${className}`} />
    }

    // Show placeholder on error
    if (error || !imageSrc) {
        return (
            <div className={`bg-muted flex items-center justify-center ${className}`}>
                <span className="text-muted-foreground">Failed to load image</span>
            </div>
        )
    }

    // Render image
    if (fill) {
        return (
            <Image
                src={imageSrc}
                alt={alt}
                fill
                className={className}
                priority={priority}
            />
        )
    }

    return (
        <Image
            src={imageSrc}
            alt={alt}
            width={width}
            height={height}
            className={className}
            priority={priority}
        />
    )
}
