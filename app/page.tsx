import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { PatternGrid } from "@/components/pattern-grid"
import { createClient } from "@/lib/supabase/server"
import { Scissors, Download, Users, Heart, ArrowRight } from "lucide-react"
import type { Pattern, Category } from "@/lib/types"

async function getHomeData() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()
    profile = data
  }

  const { data: patterns } = await supabase
    .from("patterns")
    .select(`
      *,
      profiles (id, display_name, avatar_url),
      categories (id, name, slug)
    `)
    .order("created_at", { ascending: false })
    .limit(8)

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name")

  // Get pattern stats
  const { count: patternCount } = await supabase
    .from("patterns")
    .select("*", { count: "exact", head: true })

  return {
    user,
    profile,
    patterns: (patterns as Pattern[]) || [],
    categories: (categories as Category[]) || [],
    stats: {
      patterns: patternCount || 0,
    }
  }
}

export default async function HomePage() {
  const { user, profile, patterns, categories, stats } = await getHomeData()

  return (
    <div className="flex min-h-screen flex-col">
      <Header user={user} profile={profile} />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b bg-gradient-to-b from-secondary/50 to-background py-20 lg:py-28">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
              <Badge variant="secondary" className="mb-6">
                Free Pattern Sharing Community
              </Badge>
              <h1 className="mb-6 text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
                Share the joy of sewing with{" "}
                <span className="text-primary">Stitchery</span>
              </h1>
              <p className="mb-8 text-lg text-muted-foreground leading-relaxed text-pretty">
                A cozy corner of the internet where sewers come together to share patterns,
                discover new projects, and inspire each other&apos;s creative journeys.
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <Button asChild size="lg" className="text-base">
                  <Link href="/patterns">
                    Browse Patterns
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                {!user && (
                  <Button asChild variant="outline" size="lg" className="text-base">
                    <Link href="/auth/sign-up">Join the Community</Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
          {/* Decorative elements */}
          <div className="absolute -left-4 top-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -right-4 bottom-20 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
        </section>

        {/* Stats Section */}
        <section className="border-b py-12">
          <div className="container mx-auto px-4">
            <div className="grid gap-8 sm:grid-cols-3">
              <div className="flex items-center justify-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Scissors className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.patterns}+</p>
                  <p className="text-sm text-muted-foreground">Patterns Shared</p>
                </div>
              </div>
              <div className="flex items-center justify-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/20 text-accent-foreground">
                  <Download className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold">Free</p>
                  <p className="text-sm text-muted-foreground">Always & Forever</p>
                </div>
              </div>
              <div className="flex items-center justify-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-chart-5/20 text-chart-5">
                  <Heart className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold">Community</p>
                  <p className="text-sm text-muted-foreground">Made with Love</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="mb-10 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Browse by Category</h2>
                <p className="mt-2 text-muted-foreground">Find patterns for your next project</p>
              </div>
              <Button asChild variant="ghost">
                <Link href="/categories">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
              {categories.slice(0, 8).map((category) => (
                <Link key={category.id} href={`/patterns?category=${category.slug}`}>
                  <Card className="group cursor-pointer transition-all hover:shadow-md hover:border-primary/30">
                    <CardContent className="flex items-center gap-4 p-5">
                      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-secondary text-secondary-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <Scissors className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-medium group-hover:text-primary transition-colors">{category.name}</h3>
                        <p className="text-sm text-muted-foreground">{category.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Latest Patterns Section */}
        <section className="border-t bg-muted/20 py-16">
          <div className="container mx-auto px-4">
            <div className="mb-10 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Latest Patterns</h2>
                <p className="mt-2 text-muted-foreground">Fresh creations from our community</p>
              </div>
              <Button asChild variant="ghost">
                <Link href="/patterns">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <PatternGrid
              patterns={patterns}
              emptyMessage="Be the first to share a pattern with the community!"
            />
          </div>
        </section>

        {/* CTA Section */}
        {!user && (
          <section className="py-20">
            <div className="container mx-auto px-4">
              <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
                <CardContent className="p-8 sm:p-12">
                  <div className="mx-auto max-w-2xl text-center">
                    <Users className="mx-auto mb-6 h-12 w-12 text-primary" />
                    <h2 className="mb-4 text-2xl font-bold tracking-tight sm:text-3xl">
                      Join Our Creative Community
                    </h2>
                    <p className="mb-8 text-muted-foreground leading-relaxed">
                      Sign up for free to share your own patterns, save your favorites,
                      and connect with fellow sewers from around the world.
                    </p>
                    <Button asChild size="lg" className="text-base">
                      <Link href="/auth/sign-up">
                        Get Started Free
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  )
}
