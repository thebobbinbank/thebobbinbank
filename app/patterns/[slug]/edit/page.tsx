import { PageLayout } from "@/components/page-layout"
import { PatternForm } from "@/components/pattern-form"
import { createClient } from "@/lib/supabase/server"
import type { Category, Pattern } from "@/lib/types"
import { notFound, redirect } from "next/navigation"

interface EditPatternPageProps {
    readonly params: Promise<{ readonly slug: string }>
}

async function getEditData(slug: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect("/auth/login?redirect=/patterns/" + slug + "/edit")
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

    const { data: pattern } = await supabase
        .from("patterns")
        .select("*")
        .eq("slug", slug)
        .single()

    if (!pattern) {
        notFound()
    }

    // Check if user owns this pattern
    if (pattern.user_id !== user.id) {
        redirect("/patterns/" + slug)
    }

    const { data: categories } = await supabase
        .from("categories")
        .select("*")
        .order("name")

    return {
        user,
        profile,
        pattern: pattern as Pattern,
        categories: (categories as Category[]) || [],
    }
}

export default async function EditPatternPage({ params }: EditPatternPageProps) {
    const { slug } = await params
    const { user, profile, pattern, categories } = await getEditData(slug)

    return (
        <PageLayout user={user} profile={profile}>
            <div className="mb-8 max-w-3xl">
                <h1 className="text-3xl font-bold tracking-tight">Edit Pattern</h1>
                <p className="mt-2 text-muted-foreground">
                    Update your pattern details
                </p>
            </div>

            <div className="max-w-3xl">
                <PatternForm user={user} categories={categories} pattern={pattern} />
            </div>
        </PageLayout>
    )
}
