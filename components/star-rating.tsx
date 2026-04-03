"use client"

import { cn } from "@/lib/utils"
import { Star } from "lucide-react"

interface StarRatingProps {
  rating: number
  maxRating?: number
  size?: "sm" | "md" | "lg"
  interactive?: boolean
  onRatingChange?: (rating: number) => void
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
}

export function StarRating({
  rating,
  maxRating = 5,
  size = "md",
  interactive = false,
  onRatingChange,
}: StarRatingProps) {
  const ratings = Array.from({ length: maxRating }, (_, i) => i + 1)
  return (
    <div className="flex items-center gap-0.5">
      {ratings.map((starValue) => {
        const isFilled = starValue <= rating
        const isHalf = !isFilled && starValue - 0.5 <= rating

        return (
          <button
            key={starValue}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onRatingChange?.(starValue)}
            className={cn(
              "transition-colors",
              interactive && "cursor-pointer hover:scale-110",
              !interactive && "cursor-default"
            )}
          >
            <Star
              className={cn(
                sizeClasses[size],
                isFilled ? "fill-primary text-primary" : "text-muted-foreground/30",
                isHalf && "text-primary"
              )}
            />
          </button>
        )
      })}
    </div>
  )
}
