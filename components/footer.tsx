import { Scissors } from "lucide-react"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Scissors className="h-4 w-4" />
              </div>
              <span className="text-lg font-semibold">The Bobbin Bank</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              A cozy community for sewers to share and discover beautiful sewing patterns.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold">Explore</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/patterns" className="text-muted-foreground hover:text-foreground transition-colors">
                  Browse Patterns
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-muted-foreground hover:text-foreground transition-colors">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/patterns?difficulty=beginner" className="text-muted-foreground hover:text-foreground transition-colors">
                  Beginner Friendly
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold">Community</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/patterns/new" className="text-muted-foreground hover:text-foreground transition-colors">
                  Share a Pattern
                </Link>
              </li>
              <li>
                <Link href="/auth/sign-up" className="text-muted-foreground hover:text-foreground transition-colors">
                  Join The Bobbin Bank
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold">Support</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <span className="text-muted-foreground">
                  thebobbinbank@gmail.com
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} The Bobbin Bank. Made with love for the sewing community.</p>
        </div>
      </div>
    </footer>
  )
}
