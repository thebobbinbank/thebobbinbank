"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import type { User } from "@supabase/supabase-js"
import Link from "next/link"

interface FavoriteButtonProps {
  patternId: string
  initialFavorited: boolean
  user: User | null
  className?: string
}

export function FavoriteButton({
  patternId,
  initialFavorited,
  user,
  className,
}: FavoriteButtonProps) {
  const router = useRouter()
  const supabase = createClient()

  const [isFavorited, setIsFavorited] = useState(initialFavorited)
  const [isLoading, setIsLoading] = useState(false)

  const handleToggle = async () => {
    if (!user) {
      router.push("/auth/login")
      return
    }

    setIsLoading(true)

    try {
      if (isFavorited) {
        // Remove favorite
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("pattern_id", patternId)
          .eq("user_id", user.id)

        if (error) throw error
        setIsFavorited(false)
      } else {
        // Add favorite
        const { error } = await supabase.from("favorites").insert({
          pattern_id: patternId,
          user_id: user.id,
        })

        if (error) throw error
        setIsFavorited(true)
      }

      router.refresh()
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return (
      <Button variant="outline" className={cn("flex-1", className)} asChild>
        <Link href="/auth/login">
          <Heart className="mr-2 h-4 w-4" />
          Save to Favorites
        </Link>
      </Button>
    )
  }

  return (
    <Button
      variant={isFavorited ? "default" : "outline"}
      className={cn("flex-1", className)}
      onClick={handleToggle}
      disabled={isLoading}
    >
      <Heart
        className={cn(
          "mr-2 h-4 w-4 transition-all",
          isFavorited && "fill-current"
        )}
      />
      {isFavorited ? "Saved" : "Save"}
    </Button>
  )
}
