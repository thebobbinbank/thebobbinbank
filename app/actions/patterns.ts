"use server"

import { createClient } from "@/lib/supabase/server"
import type { Difficulty, Pattern } from "@/lib/types"

export async function incrementDownloadCount(patternId: string): Promise<void> {
    try {
        const supabase = await createClient()

        // Get current download count
        const { data: pattern, error: fetchError } = await supabase
            .from("patterns")
            .select("downloads")
            .eq("id", patternId)
            .single()

        if (fetchError || !pattern) {
            console.error("Failed to fetch pattern:", fetchError)
            return
        }

        // Increment download count
        const { error: updateError } = await supabase
            .from("patterns")
            .update({ downloads: pattern.downloads + 1 })
            .eq("id", patternId)

        if (updateError) {
            console.error("Failed to increment download count:", updateError)
        }
    } catch (error) {
        console.error("Download increment error:", error)
        // Don't throw - this shouldn't block the download
    }
}

export async function updatePattern(
    patternId: string,
    updates: {
        title: string
        description?: string | null
        category_id?: string | null
        difficulty: Difficulty
        tags: string[]
        image_url?: string | null
    }
): Promise<Pattern> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        throw new Error("Unauthorized")
    }

    // Get the pattern to verify ownership
    const { data: pattern, error: fetchError } = await supabase
        .from("patterns")
        .select("user_id")
        .eq("id", patternId)
        .single()

    if (fetchError || !pattern) {
        throw new Error("Pattern not found")
    }

    if (pattern.user_id !== user.id) {
        throw new Error("Unauthorized")
    }

    // Update the pattern
    const { data, error: updateError } = await supabase
        .from("patterns")
        .update({
            title: updates.title.trim(),
            description: updates.description?.trim() || null,
            category_id: updates.category_id || null,
            difficulty: updates.difficulty,
            tags: updates.tags,
            image_url: updates.image_url,
            updated_at: new Date().toISOString(),
        })
        .eq("id", patternId)
        .select()
        .single()

    if (updateError) {
        throw updateError
    }

    return data as Pattern
}

export async function deletePattern(patternId: string): Promise<void> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        throw new Error("Unauthorized")
    }

    // Get the pattern to verify ownership
    const { data: pattern, error: fetchError } = await supabase
        .from("patterns")
        .select("user_id")
        .eq("id", patternId)
        .single()

    if (fetchError || !pattern) {
        throw new Error("Pattern not found")
    }

    if (pattern.user_id !== user.id) {
        throw new Error("Unauthorized")
    }

    // Delete the pattern
    const { error: deleteError } = await supabase
        .from("patterns")
        .delete()
        .eq("id", patternId)

    if (deleteError) {
        throw deleteError
    }
}
