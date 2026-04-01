"use client"

import { BlobAvatarImage } from "@/components/blob-avatar-image"
import { StarRating } from "@/components/star-rating"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import type { Review } from "@/lib/types"
import type { User } from "@supabase/supabase-js"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface ReviewSectionProps {
  patternId: string
  reviews: Review[]
  avgRating: number
  reviewCount: number
  user: User | null
  userReview: Review | null
}

export function ReviewSection({
  patternId,
  reviews,
  avgRating,
  reviewCount,
  user,
  userReview,
}: ReviewSectionProps) {
  const router = useRouter()
  const supabase = createClient()

  const [rating, setRating] = useState(userReview?.rating || 0)
  const [content, setContent] = useState(userReview?.content || "")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || rating === 0) return

    setIsSubmitting(true)
    setError(null)

    try {
      if (userReview) {
        // Update existing review
        const { error } = await supabase
          .from("reviews")
          .update({ rating, content, updated_at: new Date().toISOString() })
          .eq("id", userReview.id)

        if (error) throw error
      } else {
        // Create new review
        const { error } = await supabase.from("reviews").insert({
          pattern_id: patternId,
          user_id: user.id,
          rating,
          content,
        })

        if (error) throw error
      }

      router.refresh()
    } catch (err) {
      setError("Failed to submit review. Please try again.")
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Reviews</h2>
        {reviewCount > 0 && (
          <div className="flex items-center gap-2">
            <StarRating rating={avgRating} size="md" />
            <span className="text-sm text-muted-foreground">
              {avgRating.toFixed(1)} ({reviewCount} {reviewCount === 1 ? "review" : "reviews"})
            </span>
          </div>
        )}
      </div>

      {/* Review Form */}
      {user ? (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  {userReview ? "Update your rating" : "Your rating"}
                </label>
                <StarRating
                  rating={rating}
                  interactive
                  onRatingChange={setRating}
                  size="lg"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Your review (optional)
                </label>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Share your experience with this pattern..."
                  rows={3}
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" disabled={isSubmitting || rating === 0}>
                {isSubmitting && <Spinner className="mr-2" />}
                {userReview ? "Update Review" : "Submit Review"}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card className="mb-6">
          <CardContent className="py-6 text-center">
            <p className="text-muted-foreground">
              <Link href="/auth/login" className="text-primary hover:underline">
                Sign in
              </Link>{" "}
              to leave a review
            </p>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">
            No reviews yet. Be the first to review this pattern!
          </p>
        ) : (
          reviews.map((review) => {
            const reviewerName = review.profiles?.display_name || "Anonymous"
            const reviewerInitials = reviewerName
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)

            const reviewDate = new Date(review.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })

            return (
              <Card key={review.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-10 w-10">
                      <BlobAvatarImage src={review.profiles?.avatar_url} />
                      <AvatarFallback className="bg-secondary text-sm">
                        {reviewerInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="mb-2 flex items-center justify-between">
                        <div>
                          <p className="font-medium">{reviewerName}</p>
                          <p className="text-xs text-muted-foreground">{reviewDate}</p>
                        </div>
                        <StarRating rating={review.rating} size="sm" />
                      </div>
                      {review.content && (
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {review.content}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
