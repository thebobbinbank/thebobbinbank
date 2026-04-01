import { redirect } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { PatternGrid } from "@/components/pattern-grid"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"
import { Plus } from "lucide-react"
import type { Pattern } from "@/lib/types"

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
    .select(`
      *,
      profiles (id, display_name, avatar_url),
      categories (id, name, slug)
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return {
    user,
    profile,
    patterns: (patterns as Pattern[]) || [],
  }
}

export default async function MyPatternsPage() {
  const { user, profile, patterns } = await getMyPatternsData()

  return (
    <div className="flex min-h-screen flex-col">
      <Header user={user} profile={profile} />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
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
        </div>
      </main>

      <Footer />
    </div>
  )
}
