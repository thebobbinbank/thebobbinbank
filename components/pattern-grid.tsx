import { PatternCard } from "@/components/pattern-card"
import type { Pattern } from "@/lib/types"

interface PatternGridProps {
  patterns: Pattern[]
  emptyMessage?: string
}

export function PatternGrid({ patterns, emptyMessage = "No patterns found." }: PatternGridProps) {
  if (patterns.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 text-6xl">🧵</div>
        <h3 className="mb-2 text-lg font-medium">No patterns yet</h3>
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {patterns.map((pattern) => (
        <PatternCard key={pattern.id} pattern={pattern} />
      ))}
    </div>
  )
}
