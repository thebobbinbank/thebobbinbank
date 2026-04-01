import { redirect } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProfileForm } from "@/components/profile-form"
import { createClient } from "@/lib/supabase/server"

async function getProfileData() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login?redirect=/profile")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  return {
    user,
    profile,
  }
}

export default async function ProfilePage() {
  const { user, profile } = await getProfileData()

  return (
    <div className="flex min-h-screen flex-col">
      <Header user={user} profile={profile} />

      <main className="flex-1">
        <div className="container mx-auto max-w-2xl px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
            <p className="mt-2 text-muted-foreground">
              Manage your profile information
            </p>
          </div>

          <ProfileForm user={user} profile={profile} />
        </div>
      </main>

      <Footer />
    </div>
  )
}
