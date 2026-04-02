import { Footer } from "@/components/footer"
import { Header } from "@/components/header"
import type { Profile } from "@/lib/types"

interface PageLayoutProps {
    children: React.ReactNode
    user?: any
    profile?: Profile | null
}

export function PageLayout({ children, user, profile }: PageLayoutProps) {
    return (
        <div className="flex min-h-screen flex-col">
            <Header user={user} profile={profile} />

            <main className="flex-1">
                <div className="w-full bg-background">
                    <div className="container mx-auto px-4 py-8 md:px-24 md:py-12">
                        {children}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
