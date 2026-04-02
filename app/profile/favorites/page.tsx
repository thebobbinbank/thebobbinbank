import { PageLayout } from "@/components/page-layout"
import { PatternGrid } from "@/components/pattern-grid"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"
import type { Pattern } from "@/lib/types"
import { Scissors } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

async function getFavoritesData() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login?redirect=/profile/favorites")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  // Get favorite pattern IDs
  const { data: favorites } = await supabase
    .from("favorites")
    .select("pattern_id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  const patternIds = favorites?.map((f) => f.pattern_id) || []

  let patterns: Pattern[] = []
  if (patternIds.length > 0) {
    const { data } = await supabase
      .from("patterns")
      .select(`
        *,
        profiles (id, display_name, avatar_url),
        categories (id, name, slug)
      `)
      .in("id", patternIds)

    patterns = (data as Pattern[]) || []
  }

  return {
    user,
    profile,
    patterns,
  }
}

export default async function FavoritesPage() {
  const { user, profile, patterns } = await getFavoritesData()

  return (
    <PageLayout user={user} profile={profile}>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Favorites</h1>
          <p className="mt-2 text-muted-foreground">
            {patterns.length} saved {patterns.length === 1 ? "pattern" : "patterns"}
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/patterns">
            <Scissors className="mr-2 h-4 w-4" />
            Browse Patterns
          </Link>
        </Button>
      </div>

      <PatternGrid
        patterns={patterns}
        emptyMessage="You haven't saved any patterns yet. Browse patterns and save your favorites!"
      />
    </PageLayout>
  )
}
