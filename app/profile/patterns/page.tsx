import { PageLayout } from "@/components/page-layout"
import { PatternGrid } from "@/components/pattern-grid"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"
import type { Pattern } from "@/lib/types"
import { Plus } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

async function getMyPatternsData() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login?redirect=/profile/patterns")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  const { data: patterns } = await supabase
    .from("patterns")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  // Enrich patterns with profile and category data
  const enrichedPatterns = await Promise.all(
    (patterns || []).map(async (pattern) => {
      let enrichedPattern: any = { ...pattern }

      // Fetch profile data
      if (pattern.user_id) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("id, display_name, avatar_url")
          .eq("id", pattern.user_id)
          .single()
        enrichedPattern.profiles = profileData
      }

      // Fetch category data
      if (pattern.category_id) {
        const { data: category } = await supabase
          .from("categories")
          .select("id, name, slug")
          .eq("id", pattern.category_id)
          .single()
        enrichedPattern.categories = category
      }

      return enrichedPattern
    })
  )

  return {
    user,
    profile,
    patterns: (enrichedPatterns as Pattern[]) || [],
  }
}

export default async function MyPatternsPage() {
  const { user, profile, patterns } = await getMyPatternsData()

  return (
    <PageLayout user={user} profile={profile}>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Patterns</h1>
          <p className="mt-2 text-muted-foreground">
            {patterns.length} {patterns.length === 1 ? "pattern" : "patterns"} shared
          </p>
        </div>
        <Button asChild>
          <Link href="/patterns/new">
            <Plus className="mr-2 h-4 w-4" />
            Share Pattern
          </Link>
        </Button>
      </div>

      <PatternGrid
        patterns={patterns}
        emptyMessage="You haven't shared any patterns yet. Share your first pattern!"
      />
    </PageLayout>
  )
}
