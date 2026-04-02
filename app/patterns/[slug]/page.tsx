import { BlobAvatarImage } from "@/components/blob-avatar-image"
import { BlobImage } from "@/components/blob-image"
import { CommentSection } from "@/components/comment-section"
import { DownloadButton } from "@/components/download-button"
import { FavoriteButton } from "@/components/favorite-button"
import { PageLayout } from "@/components/page-layout"
import { ReviewSection } from "@/components/review-section"
import { ShareButton } from "@/components/share-button"
import { StarRating } from "@/components/star-rating"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { createClient } from "@/lib/supabase/server"
import type { Comment, Pattern, Review } from "@/lib/types"
import { ArrowLeft, Calendar, Download } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

interface PatternPageProps {
  params: Promise<{ slug: string }>
}

const difficultyColors = {
  beginner: "bg-accent/20 text-accent-foreground border-accent/30",
  intermediate: "bg-primary/10 text-primary border-primary/30",
  advanced: "bg-chart-5/20 text-chart-5 border-chart-5/30",
}

async function getPatternData(slug: string) {
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

  // Get pattern with creator profile and category
  const { data: pattern, error: patternError } = await supabase
    .from("patterns")
    .select("*")
    .eq("slug", slug)
    .single()

  if (patternError) {
    console.error("Pattern query error:", patternError)
    return null
  }

  if (!pattern) {
    console.error("Pattern not found for slug:", slug)
    return null
  }

  // Get profile separately
  const { data: creatorProfile } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url, username")
    .eq("id", pattern.user_id)
    .single()

  // Get category separately
  const { data: category } = await supabase
    .from("categories")
    .select("id, name, slug")
    .eq("id", pattern.category_id)
    .single()

  // Reconstruct pattern object with relations
  const patternWithRelations = {
    ...pattern,
    profiles: creatorProfile,
    categories: category,
  }

  // Get reviews with profiles
  const { data: reviews } = await supabase
    .from("reviews")
    .select(`
      *,
      profiles (id, display_name, avatar_url)
    `)
    .eq("pattern_id", patternWithRelations.id)
    .order("created_at", { ascending: false })

  // Get comments with profiles
  const { data: comments } = await supabase
    .from("comments")
    .select(`
      *,
      profiles (id, display_name, avatar_url)
    `)
    .eq("pattern_id", patternWithRelations.id)
    .is("parent_id", null)
    .order("created_at", { ascending: false })

  // Get replies for comments
  const commentsWithReplies = await Promise.all(
    (comments || []).map(async (comment) => {
      const { data: replies } = await supabase
        .from("comments")
        .select(`
          *,
          profiles (id, display_name, avatar_url)
        `)
        .eq("parent_id", comment.id)
        .order("created_at", { ascending: true })

      return { ...comment, replies: replies || [] }
    })
  )

  // Check if user has favorited this pattern
  let isFavorited = false
  if (user) {
    const { data: favorite } = await supabase
      .from("favorites")
      .select("id")
      .eq("pattern_id", patternWithRelations.id)
      .eq("user_id", user.id)
      .single()
    isFavorited = !!favorite
  }

  // Check if user has already reviewed
  let userReview = null
  if (user) {
    const { data } = await supabase
      .from("reviews")
      .select("*")
      .eq("pattern_id", patternWithRelations.id)
      .eq("user_id", user.id)
      .single()
    userReview = data
  }

  // Calculate average rating
  const avgRating = reviews?.length
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
    : 0

  return {
    user,
    profile,
    pattern: patternWithRelations as Pattern,
    reviews: (reviews as Review[]) || [],
    comments: commentsWithReplies as Comment[],
    avgRating,
    reviewCount: reviews?.length || 0,
    isFavorited,
    userReview,
  }
}

export default async function PatternPage({ params }: PatternPageProps) {
  const { slug } = await params
  const data = await getPatternData(slug)

  if (!data) {
    notFound()
  }

  const { user, profile, pattern, reviews, comments, avgRating, reviewCount, isFavorited, userReview } = data

  const creatorName = pattern.profiles?.display_name || "Anonymous"
  const creatorInitials = creatorName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  const formattedDate = new Date(pattern.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <PageLayout user={user} profile={profile}>
      {/* Breadcrumb */}
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="-ml-3">
          <Link href="/patterns">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Patterns
          </Link>
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Pattern Image */}
          <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-muted">
            {pattern.image_url ? (
              <BlobImage
                src={pattern.image_url}
                alt={pattern.title}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <span className="text-8xl text-muted-foreground/30">
                  {pattern.categories?.name?.[0] || "P"}
                </span>
              </div>
            )}
          </div>

          {/* Pattern Info */}
          <div>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {pattern.categories && (
                <Badge variant="outline">{pattern.categories.name}</Badge>
              )}
              <Badge className={`${difficultyColors[pattern.difficulty]} border`}>
                {pattern.difficulty}
              </Badge>
            </div>

            <h1 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl text-balance">
              {pattern.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <BlobAvatarImage src={pattern.profiles?.avatar_url} />
                  <AvatarFallback className="bg-secondary text-xs">{creatorInitials}</AvatarFallback>
                </Avatar>
                <span>by <strong className="text-foreground">{creatorName}</strong></span>
              </div>

              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <span>{formattedDate}</span>
              </div>

              <div className="flex items-center gap-1.5">
                <Download className="h-4 w-4" />
                <span>{pattern.download_count} downloads</span>
              </div>

              {reviewCount > 0 && (
                <div className="flex items-center gap-1.5">
                  <StarRating rating={avgRating} size="sm" />
                  <span>({reviewCount})</span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Description */}
          <div>
            <h2 className="mb-4 text-xl font-semibold">About this Pattern</h2>
            <div className="prose prose-neutral max-w-none">
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {pattern.description || "No description provided for this pattern."}
              </p>
            </div>
          </div>

          {/* Tags */}
          {pattern.tags && pattern.tags.length > 0 && (
            <div>
              <h3 className="mb-3 text-sm font-medium text-muted-foreground">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {pattern.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Reviews Section */}
          <ReviewSection
            patternId={pattern.id}
            reviews={reviews}
            avgRating={avgRating}
            reviewCount={reviewCount}
            user={user}
            userReview={userReview}
          />

          <Separator />

          {/* Comments Section */}
          <CommentSection
            patternId={pattern.id}
            comments={comments}
            user={user}
          />
        </div>

        {/* Sidebar */}
        <div className="sticky top-24 space-y-6 h-fit">
          <Card>
            <CardHeader>
              <CardTitle>Download Pattern</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {pattern.file_name || "pattern-file.pdf"}
              </p>

              <DownloadButton
                patternId={pattern.id}
                fileUrl={pattern.file_url}
                fileName={pattern.file_name || "pattern.pdf"}
                user={user}
              />

              <div className="flex gap-2">
                <FavoriteButton
                  patternId={pattern.id}
                  initialFavorited={isFavorited}
                  user={user}
                />
                <ShareButton title={pattern.title} />
              </div>

              <Separator />

              <div className="text-xs text-muted-foreground">
                <p>Free to download and use for personal projects.</p>
                <p className="mt-1">Please credit the creator when sharing.</p>
              </div>
            </CardContent>
          </Card>

          {/* Creator Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">About the Creator</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <BlobAvatarImage src={pattern.profiles?.avatar_url} />
                  <AvatarFallback className="bg-secondary">{creatorInitials}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{creatorName}</p>
                  {pattern.profiles?.username && (
                    <p className="text-sm text-muted-foreground">@{pattern.profiles.username}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  )
}
