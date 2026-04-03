"use client"

import { uploadFile } from "@/app/actions/upload"
import { BlobAvatarImage } from "@/components/blob-avatar-image"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import type { Profile } from "@/lib/types"
import type { User } from "@supabase/supabase-js"
import { Check, Upload } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface ProfileFormProps {
  user: User
  profile: Profile | null
}

export function ProfileForm({ user, profile }: ProfileFormProps) {
  const router = useRouter()
  const supabase = createClient()

  const [displayName, setDisplayName] = useState(profile?.display_name || "")
  const [username, setUsername] = useState(profile?.username || "")
  const [bio, setBio] = useState(profile?.bio || "")
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const initials = displayName
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || user.email?.[0].toUpperCase() || "U"

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setIsSaving(true)

    try {
      let finalAvatarUrl = profile?.avatar_url

      // Upload avatar if changed
      if (avatarFile) {
        const formData = new FormData()
        formData.append("file", avatarFile)
        const { url } = await uploadFile(formData, "image")
        finalAvatarUrl = url
      }

      // Update profile
      const { error: dbError } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          display_name: displayName.trim() || null,
          username: username.trim() || null,
          bio: bio.trim() || null,
          avatar_url: finalAvatarUrl || null,
          updated_at: new Date().toISOString(),
        })

      if (dbError) throw dbError

      setSuccess(true)
      router.refresh()

      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : "Failed to update profile")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Update your public profile details</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            {/* Avatar */}
            <Field>
              <FieldLabel>Profile Picture</FieldLabel>
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  {avatarPreview ? (
                    <AvatarImage src={avatarPreview} />
                  ) : (
                    <BlobAvatarImage src={profile?.avatar_url || undefined} />
                  )}
                  <AvatarFallback className="bg-secondary text-lg">{initials}</AvatarFallback>
                </Avatar>
                <label htmlFor="avatar-file" className="cursor-pointer">
                  <input
                    id="avatar-file"
                    type="file"
                    className="hidden"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleAvatarChange}
                  />
                  <Button type="button" variant="outline" asChild>
                    <span>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Photo
                    </span>
                  </Button>
                </label>
              </div>
            </Field>

            {/* Display Name */}
            <Field>
              <FieldLabel htmlFor="displayName">Display Name</FieldLabel>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
                maxLength={50}
              />
            </Field>

            {/* Username */}
            <Field>
              <FieldLabel htmlFor="username">Username</FieldLabel>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replaceAll(/[^a-z0-9_]/g, ""))}
                placeholder="username"
                maxLength={30}
              />
              <p className="text-xs text-muted-foreground">
                Letters, numbers, and underscores only
              </p>
            </Field>

            {/* Bio */}
            <Field>
              <FieldLabel htmlFor="bio">Bio</FieldLabel>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself and your sewing journey..."
                rows={4}
                maxLength={500}
              />
            </Field>

            {/* Email (read-only) */}
            <Field>
              <FieldLabel>Email</FieldLabel>
              <Input value={user.email || ""} disabled />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed here
              </p>
            </Field>
          </FieldGroup>

          {error && (
            <div className="mt-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {success && (
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-accent/20 p-3 text-sm text-accent-foreground">
              <Check className="h-4 w-4" />
              Profile updated successfully!
            </div>
          )}

          <div className="mt-6">
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Spinner className="mr-2" />}
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
