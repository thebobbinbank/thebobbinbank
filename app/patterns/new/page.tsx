import { PageLayout } from "@/components/page-layout"
import { PatternForm } from "@/components/pattern-form"
import { createClient } from "@/lib/supabase/server"
import type { Category } from "@/lib/types"
import { redirect } from "next/navigation"

async function getUploadData() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login?redirect=/patterns/new")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name")

  return {
    user,
    profile,
    categories: (categories as Category[]) || [],
  }
}

export default async function NewPatternPage() {
  const { user, profile, categories } = await getUploadData()

  return (
    <PageLayout user={user} profile={profile}>
      <div className="mb-8 max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight">Share a Pattern</h1>
        <p className="mt-2 text-muted-foreground">
          Upload your sewing pattern to share with the community
        </p>
      </div>

      <div className="max-w-3xl">
        <PatternForm user={user} categories={categories} />
      </div>
    </PageLayout>
  )
}
