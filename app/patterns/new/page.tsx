import { redirect } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { PatternForm } from "@/components/pattern-form"
import { createClient } from "@/lib/supabase/server"
import type { Category } from "@/lib/types"

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
    <div className="flex min-h-screen flex-col">
      <Header user={user} profile={profile} />

      <main className="flex-1">
        <div className="container mx-auto max-w-3xl px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Share a Pattern</h1>
            <p className="mt-2 text-muted-foreground">
              Upload your sewing pattern to share with the community
            </p>
          </div>

          <PatternForm user={user} categories={categories} />
        </div>
      </main>

      <Footer />
    </div>
  )
}
