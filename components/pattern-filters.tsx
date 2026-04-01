"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Category, Difficulty, SortOption } from "@/lib/types"
import { Search, X } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

interface PatternFiltersProps {
  categories: Category[]
}

export function PatternFilters({ categories }: PatternFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentSearch = searchParams.get("search") || ""
  const currentCategory = searchParams.get("category") || "all"
  const currentDifficulty = searchParams.get("difficulty") || "all"
  const currentSort = (searchParams.get("sort") as SortOption) || "newest"

  const updateParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    // Treat "all" as clearing the filter
    if (value && value !== "all") {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    params.delete("page") // Reset pagination on filter change
    router.push(`/patterns?${params.toString()}`)
  }

  const clearFilters = () => {
    router.push("/patterns")
  }

  const hasFilters = currentSearch || currentCategory || currentDifficulty

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search patterns..."
            defaultValue={currentSearch}
            className="pl-9"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                updateParams("search", e.currentTarget.value)
              }
            }}
            onBlur={(e) => {
              if (e.target.value !== currentSearch) {
                updateParams("search", e.target.value)
              }
            }}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select value={currentCategory} onValueChange={(v) => updateParams("category", v)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.slug}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={currentDifficulty} onValueChange={(v) => updateParams("difficulty", v as Difficulty)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All Levels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>

          <Select value={currentSort} onValueChange={(v) => updateParams("sort", v as SortOption)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
            </SelectContent>
          </Select>

          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-10">
              <X className="mr-1 h-4 w-4" />
              Clear
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
