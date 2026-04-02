import { PageLayout } from "@/components/page-layout"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import type { Category } from "@/lib/types"
import { ArrowRight, Baby, Home, Scissors, Shirt, Sparkles } from "lucide-react"
import Link from "next/link"

const categoryIcons: Record<string, React.ReactNode> = {
  dresses: <Shirt className="h-6 w-6" />,
  "tops-blouses": <Shirt className="h-6 w-6" />,
  "pants-shorts": <Scissors className="h-6 w-6" />,
  skirts: <Scissors className="h-6 w-6" />,
  outerwear: <Scissors className="h-6 w-6" />,
  kids: <Baby className="h-6 w-6" />,
  accessories: <Sparkles className="h-6 w-6" />,
  "home-decor": <Home className="h-6 w-6" />,
}

async function getCategoriesData() {
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

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name")

  // Get pattern counts for each category
  const categoriesWithCounts = await Promise.all(
    (categories || []).map(async (category) => {
      const { count } = await supabase
        .from("patterns")
        .select("*", { count: "exact", head: true })
        .eq("category_id", category.id)

      return {
        ...category,
        pattern_count: count || 0,
      }
    })
  )

  return {
    user,
    profile,
    categories: categoriesWithCounts as (Category & { pattern_count: number })[],
  }
}

export default async function CategoriesPage() {
  const { user, profile, categories } = await getCategoriesData()

  return (
    <PageLayout user={user} profile={profile}>
      {/* Page Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Categories</h1>
        <p className="mt-2 text-muted-foreground">
          Browse patterns by category to find exactly what you&apos;re looking for
        </p>
      </div>

      {/* Categories Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {categories.map((category) => (
          <Link key={category.id} href={`/patterns?category=${category.slug}`}>
            <Card className="group h-full cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 hover:border-primary/30">
              <CardHeader>
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-secondary text-secondary-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  {categoryIcons[category.slug] || <Scissors className="h-6 w-6" />}
                </div>
                <CardTitle className="flex items-center justify-between group-hover:text-primary transition-colors">
                  {category.name}
                  <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </CardTitle>
                <CardDescription className="leading-relaxed">
                  {category.description || `Browse ${category.name.toLowerCase()} patterns`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Badge variant="secondary">
                  {category.pattern_count} {category.pattern_count === 1 ? "pattern" : "patterns"}
                </Badge>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Empty State */}
      {categories.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 text-6xl">📁</div>
          <h3 className="mb-2 text-lg font-medium">No categories yet</h3>
          <p className="text-muted-foreground">Categories will appear here once patterns are added.</p>
        </div>
      )}
    </PageLayout>
  )
}
