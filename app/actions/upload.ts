"use server"

import { createClient } from "@/lib/supabase/server";
import { put } from "@vercel/blob";

export async function uploadFile(
    formData: FormData,
    type: "pattern" | "image"
): Promise<{ url: string; pathname: string }> {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            throw new Error("Unauthorized")
        }

        const file = formData.get("file") as File

        if (!file) {
            throw new Error("No file provided")
        }

        // Validate file types
        const allowedPatternTypes = [
            "application/pdf",
            "application/zip",
            "application/x-zip-compressed",
            "image/svg+xml",
        ]
        const allowedImageTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]

        if (type === "pattern" && !allowedPatternTypes.includes(file.type)) {
            throw new Error("Invalid file type. Please upload a PDF, ZIP, or SVG file.")
        }

        if (type === "image" && !allowedImageTypes.includes(file.type)) {
            throw new Error("Invalid file type. Please upload a JPEG, PNG, WebP, or GIF image.")
        }

        // Upload to Vercel Blob
        const folder = type === "pattern" ? "patterns" : "images"
        const blob = await put(`${folder}/${user.id}/${file.name}`, file, {
            access: "private",
            addRandomSuffix: true,
        })

        return {
            url: blob.url,
            pathname: blob.pathname,
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Upload failed"
        throw new Error(errorMessage)
    }
}
