"use server"

import { createClient } from "@/lib/supabase/server"

/**
 * Fetches a file from Vercel Blob storage and returns it as base64
 * Validates user authentication before providing access
 */
export async function getFileAsBase64(pathname: string): Promise<string> {
    try {
        // Verify user is authenticated
        const supabase = await createClient()
        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
            throw new Error("Unauthorized")
        }

        // Reconstruct the blob URL from pathname
        const blobBaseUrl =
            process.env.BLOB_BASE_URL ||
            "https://f5nbtcwcjwxxb66g.private.blob.vercel-storage.com"
        const blobUrl = pathname.startsWith("http")
            ? pathname
            : `${blobBaseUrl}${pathname}`

        console.log("Server action fetching blob from:", blobUrl)

        // Try to fetch with Bearer token first (for signed/private blobs)
        const token = process.env.BLOB_READ_WRITE_TOKEN
        console.log("Has token:", !!token)

        let blobResponse = await fetch(blobUrl, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        })

        console.log("First fetch status:", blobResponse.status)

        // If that fails and we have a token, try with token in query params
        if (!blobResponse.ok && token) {
            console.log("Trying with token in query params...")
            const urlWithAuth = new URL(blobUrl)
            urlWithAuth.searchParams.append("token", token)
            blobResponse = await fetch(urlWithAuth.toString())
            console.log("Second fetch status:", blobResponse.status)
        }

        // If still not working, try without auth (signed URLs should work)
        if (!blobResponse.ok) {
            console.log("Trying without auth...")
            blobResponse = await fetch(blobUrl)
            console.log("Third fetch status:", blobResponse.status)
        }

        if (!blobResponse.ok) {
            console.error(
                `Blob fetch failed: ${blobResponse.status} ${blobResponse.statusText}`
            )
            throw new Error("File not found or access denied")
        }

        // Get blob data as array buffer
        const arrayBuffer = await blobResponse.arrayBuffer()
        console.log("Successfully fetched blob, size:", arrayBuffer.byteLength)

        // Convert to base64
        const buffer = Buffer.from(arrayBuffer)
        const base64 = buffer.toString("base64")

        return base64
    } catch (error) {
        console.error("File fetch error:", error)
        const errorMessage = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to fetch file: ${errorMessage}`)
    }
}

