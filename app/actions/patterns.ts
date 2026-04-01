"use server"

import { createClient } from "@/lib/supabase/server"

export async function incrementDownloadCount(patternId: string): Promise<void> {
    try {
        const supabase = await createClient()

        // Increment download count
        const { error } = await supabase.rpc("increment_download_count", {
            pattern_id: patternId,
        })

        // If RPC doesn't exist, use raw update
        if (error) {
            await supabase
                .from("patterns")
                .update({ download_count: supabase.rpc("download_count") })
                .eq("id", patternId)
        }
    } catch (error) {
        console.error("Download increment error:", error)
        // Don't throw - this shouldn't block the download
    }
}
