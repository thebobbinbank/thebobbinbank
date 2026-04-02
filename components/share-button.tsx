"use client"

import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Share2 } from "lucide-react"
import { useCallback } from "react"

interface ShareButtonProps {
    title: string
}

export function ShareButton({ title }: ShareButtonProps) {
    const { toast } = useToast()

    const handleShare = useCallback(async () => {
        const url = typeof window !== "undefined" ? window.location.href : ""
        const shareText = `Check out this pattern: ${title}`

        // Try native share API first (mobile)
        if (navigator.share) {
            try {
                await navigator.share({
                    title: title,
                    text: shareText,
                    url: url,
                })
                return
            } catch (error) {
                // User cancelled share or error occurred, fall through to clipboard
                if ((error as Error).name !== "AbortError") {
                    console.error("Share failed:", error)
                }
            }
        }

        // Fallback to clipboard
        try {
            await navigator.clipboard.writeText(url)
            toast({
                title: "Copied!",
                description: "Pattern link copied to clipboard",
            })
        } catch (error) {
            console.error("Failed to copy to clipboard:", error)
            toast({
                title: "Share failed",
                description: "Could not copy link to clipboard",
                variant: "destructive",
            })
        }
    }, [title, toast])

    return (
        <Button
            variant="outline"
            size="icon"
            className="flex-shrink-0"
            onClick={handleShare}
            title="Share this pattern"
        >
            <Share2 className="h-4 w-4" />
        </Button>
    )
}
