"use client"

import { BlobAvatarImage } from "@/components/blob-avatar-image"
import { BlobImage } from "@/components/blob-image"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import type { Pattern } from "@/lib/types"
import { Download, Star } from "lucide-react"
import Link from "next/link"

interface PatternCardProps {
  pattern: Pattern
}

const difficultyColors = {
  beginner: "bg-accent/80 text-accent-foreground border-accent/30",
  intermediate: "bg-primary/10 text-primary border-primary/30",
  advanced: "bg-chart-5/80 text-chart-5 border-chart-5/30",
}

export function PatternCard({ pattern }: PatternCardProps) {
  const avgRating = pattern.avg_rating || 0
  const reviewCount = pattern.review_count || 0
  const creatorName = pattern.profiles?.display_name || "Anonymous"
  const creatorInitials = creatorName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <Link href={`/patterns/${pattern.slug}`}>
      <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-border/50">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {pattern.image_url ? (
            <BlobImage
              src={pattern.image_url}
              alt={pattern.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-secondary/50">
              <span className="text-4xl text-muted-foreground/50">
                {pattern.categories?.name?.[0] || "P"}
              </span>
            </div>
          )}
          <div className="absolute right-2 top-2">
            <Badge className={`${difficultyColors[pattern.difficulty]} border`}>
              {pattern.difficulty}
            </Badge>
          </div>
        </div>
        <CardContent className="p-4">
          <div className="mb-2 flex items-center gap-2">
            {pattern.categories && (
              <Badge variant="outline" className="text-xs">
                {pattern.categories.name}
              </Badge>
            )}
          </div>
          <h3 className="mb-2 line-clamp-1 text-lg font-semibold group-hover:text-primary transition-colors">
            {pattern.title}
          </h3>
          <p className="mb-3 line-clamp-2 text-sm text-muted-foreground leading-relaxed">
            {pattern.description || "No description provided."}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <BlobAvatarImage src={pattern.profiles?.avatar_url} />
                <AvatarFallback className="text-xs bg-secondary">{creatorInitials}</AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">{creatorName}</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {reviewCount > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                  <span>{avgRating.toFixed(1)}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Download className="h-3.5 w-3.5" />
                <span>{pattern.downloads}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
