"use server"

import { createClient, createAdminAuthClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

/**
 * Deletes the user's account and all associated data
 * This includes:
 * - User profile
 * - All created patterns
 * - All reviews and comments
 * - All favorites
 * Database handles cascading deletes via ON DELETE CASCADE constraints
 */
export async function deleteAccount(): Promise<void> {
  const supabase = await createClient()

  // Verify user is authenticated
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error("Unauthorized")
  }

  try {
    // Create admin client for delete operation
    // This requires SUPABASE_SERVICE_ROLE_KEY to be set in environment
    const adminAuth = createAdminAuthClient()

    // Delete the user from Supabase Auth using admin API
    // This will cascade delete:
    // - profiles entry
    // - all patterns created by the user
    // - all reviews created by the user
    // - all comments created by the user
    // - all favorites created by the user
    const { error: deleteError } = await adminAuth.auth.admin.deleteUser(user.id)

    if (deleteError) {
      throw deleteError
    }

    // Sign out the user to clear session
    await supabase.auth.signOut()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to delete account"
    throw new Error(errorMessage)
  }

  // Redirect to home page
  redirect("/")
}
