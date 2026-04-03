import { PageLayout } from "@/components/page-layout"
import { PatternFilters } from "@/components/pattern-filters"
import { PatternGrid } from "@/components/pattern-grid"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"
import type { Category, Difficulty, Pattern, SortOption } from "@/lib/types"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { Suspense } from "react"

const PATTERNS_PER_PAGE = 12

interface PatternsPageProps {
  readonly searchParams: Promise<{
    readonly search?: string
    readonly category?: string
    readonly difficulty?: string
    readonly sort?: string
    readonly page?: string
  }>
}

async function getPatternsData(searchParams: Awaited<PatternsPageProps["searchParams"]>) {
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

  // Build query
  let query = supabase
    .from("patterns")
    .select("*", { count: "exact" })

  // Apply filters
  if (searchParams.search) {
    query = query.or(`title.ilike.%${searchParams.search}%,description.ilike.%${searchParams.search}%`)
  }

  if (searchParams.category) {
    // Get category ID from slug first
    const { data: categoryData } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", searchParams.category)
      .single()

    if (categoryData) {
      query = query.eq("category_id", categoryData.id)
    }
  }

  if (searchParams.difficulty) {
    query = query.eq("difficulty", searchParams.difficulty as Difficulty)
  }

  // Apply sorting
  const sort = (searchParams.sort as SortOption) || "newest"
  switch (sort) {
    case "oldest":
      query = query.order("created_at", { ascending: true })
      break
    case "popular":
      query = query.order("downloads", { ascending: false })
      break
    case "rating":
      query = query.order("created_at", { ascending: false }) // TODO: Add avg_rating computed column
      break
    case "newest":
    default:
      query = query.order("created_at", { ascending: false })
  }

  // Pagination
  const page = Number.parseInt(searchParams.page || "1", 10)
  const from = (page - 1) * PATTERNS_PER_PAGE
  const to = from + PATTERNS_PER_PAGE - 1

  query = query.range(from, to)

  const { data: patterns, count } = await query

  // Enrich patterns with profile and category data
  const enrichedPatterns = await Promise.all(
    (patterns || []).map(async (pattern) => {
      let enrichedPattern: any = { ...pattern }

      // Fetch profile data
      if (pattern.user_id) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("id, display_name, avatar_url")
          .eq("id", pattern.user_id)
          .single()
        enrichedPattern.profiles = profile
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
    categories: (categories as Category[]) || [],
    totalCount: count || 0,
    currentPage: page,
    totalPages: Math.ceil((count || 0) / PATTERNS_PER_PAGE),
  }
}

function PatternsSkeleton() {
  const skeletonItems = Array.from({ length: 8 }, () => crypto.randomUUID());

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {skeletonItems.map((id) => (
        <div key={id} className="animate-pulse">
          <div className="aspect-[4/3] rounded-lg bg-muted" />
          <div className="mt-4 space-y-2">
            <div className="h-4 w-3/4 rounded bg-muted" />
            <div className="h-3 w-full rounded bg-muted" />
            <div className="h-3 w-2/3 rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default async function PatternsPage({ searchParams }: PatternsPageProps) {
  const params = await searchParams
  const { user, profile, patterns, categories, totalCount, currentPage, totalPages } = await getPatternsData(params)

  const buildPageUrl = (page: number) => {
    const newParams = new URLSearchParams()
    if (params.search) newParams.set("search", params.search)
    if (params.category) newParams.set("category", params.category)
    if (params.difficulty) newParams.set("difficulty", params.difficulty)
    if (params.sort) newParams.set("sort", params.sort)
    newParams.set("page", page.toString())
    return `/patterns?${newParams.toString()}`
  }

  return (
    <PageLayout user={user} profile={profile}>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Browse Patterns</h1>
        <p className="mt-2 text-muted-foreground">
          Discover {totalCount} free patterns from our community
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8">
        <Suspense fallback={<div className="h-10 animate-pulse rounded bg-muted" />}>
          <PatternFilters categories={categories} />
        </Suspense>
      </div>

      {/* Pattern Grid */}
      <Suspense fallback={<PatternsSkeleton />}>
        <PatternGrid
          patterns={patterns}
          emptyMessage="No patterns match your filters. Try adjusting your search."
        />
      </Suspense>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-12 flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage <= 1}
            asChild={currentPage > 1}
          >
            {currentPage > 1 ? (
              <Link href={buildPageUrl(currentPage - 1)}>
                <ChevronLeft className="mr-1 h-4 w-4" />
                Previous
              </Link>
            ) : (
              <>
                <ChevronLeft className="mr-1 h-4 w-4" />
                Previous
              </>
            )}
          </Button>

          <div className="flex items-center gap-1 px-4">
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
          </div>

          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= totalPages}
            asChild={currentPage < totalPages}
          >
            {currentPage < totalPages ? (
              <Link href={buildPageUrl(currentPage + 1)}>
                Next
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            ) : (
              <>
                Next
                <ChevronRight className="ml-1 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      )}
    </PageLayout>
  )
}
