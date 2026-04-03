import { DeleteAccountButton } from "@/components/delete-account-button"
import { PageLayout } from "@/components/page-layout"
import { ProfileForm } from "@/components/profile-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

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
    <PageLayout user={user} profile={profile}>
      <div className="mb-8 max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
        <p className="mt-2 text-muted-foreground">
          Manage your profile information
        </p>
      </div>

      <div className="max-w-2xl">
        <ProfileForm user={user} profile={profile} />
      </div>

      <div className="mt-12 max-w-2xl">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>Irreversible actions</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Delete your account and all associated data. This action cannot be undone.
            </p>
            <DeleteAccountButton />
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  )
}
