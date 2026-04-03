"use client"

import { getFileAsBase64 } from "@/app/actions/files"
import { updatePattern } from "@/app/actions/patterns"
import { uploadFile } from "@/app/actions/upload"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import type { Category, Difficulty, Pattern } from "@/lib/types"
import { base64ToDataUrl, getContentType, getPathFromBlobUrl } from "@/lib/utils"
import type { User } from "@supabase/supabase-js"
import { FileText, Image as ImageIcon, Upload, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"

interface PatternFormProps {
  user: User
  categories: Category[]
  pattern?: Pattern
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replaceAll(/(^-|-$)/g, "")
    .slice(0, 100) + "-" + Date.now().toString(36)
}

export function PatternForm({ user, categories, pattern }: PatternFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const isEditing = !!pattern

  const [title, setTitle] = useState(pattern?.title || "")
  const [description, setDescription] = useState(pattern?.description || "")
  const [categoryId, setCategoryId] = useState(pattern?.category_id || "")
  const [difficulty, setDifficulty] = useState<Difficulty>(pattern?.difficulty || "beginner")
  const [tags, setTags] = useState<string[]>(pattern?.tags || [])
  const [tagInput, setTagInput] = useState("")

  const [patternFile, setPatternFile] = useState<File | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(pattern?.image_url || null)
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(pattern?.image_url || null)

  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState("")
  const [error, setError] = useState<string | null>(null)

  // Load existing image as data URL when editing
  useEffect(() => {
    if (isEditing && pattern?.image_url && !imageFile) {
      const loadImage = async () => {
        try {
          const imageUrl = pattern.image_url!
          const pathname = getPathFromBlobUrl(imageUrl)
          const base64 = await getFileAsBase64(pathname)
          const contentType = getContentType(pathname)
          const dataUrl = base64ToDataUrl(base64, contentType)
          setImagePreview(dataUrl)
        } catch (err) {
          console.error("Failed to load image:", err)
        }
      }
      loadImage()
    }
  }, [isEditing, pattern?.image_url, imageFile])

  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const handlePatternChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPatternFile(file)
    }
  }, [])

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase()
    if (tag && !tags.includes(tag) && tags.length < 10) {
      setTags([...tags, tag])
      setTagInput("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove))
  }

  const validateForm = (): string | null => {
    if (!title.trim()) return "Please enter a title"
    if (!isEditing && !patternFile) return "Please upload a pattern file"
    return null
  }

  const uploadPatternFile = async (): Promise<string | null> => {
    if (!patternFile) return null
    setUploadProgress("Uploading pattern file...")
    const formData = new FormData()
    formData.append("file", patternFile)
    const { url } = await uploadFile(formData, "pattern")
    return url
  }

  const uploadImageFile = async (): Promise<string | null> => {
    if (!imageFile) return null
    setUploadProgress("Uploading preview image...")
    const formData = new FormData()
    formData.append("file", imageFile)
    const { url } = await uploadFile(formData, "image")
    return url
  }

  const determineImageUrl = async (): Promise<string | null> => {
    if (imageFile) return uploadImageFile()
    return isEditing ? originalImageUrl : null
  }

  const updateExistingPattern = async (fileUrl: string | null, imageUrl: string | null): Promise<void> => {
    setUploadProgress("Updating pattern...")
    await updatePattern(pattern!.id, {
      title: title.trim(),
      description: description.trim() || null,
      category_id: categoryId || null,
      difficulty,
      tags,
      image_url: imageUrl,
    })
    router.push(`/patterns/${pattern!.slug}`)
  }

  const createNewPattern = async (fileUrl: string | null, imageUrl: string | null): Promise<void> => {
    setUploadProgress("Creating pattern...")
    const slug = generateSlug(title)

    const { data, error: dbError } = await supabase
      .from("patterns")
      .insert({
        user_id: user.id,
        category_id: categoryId || null,
        title: title.trim(),
        slug,
        description: description.trim() || null,
        difficulty,
        image_url: imageUrl,
        file_url: fileUrl,
        file_name: patternFile!.name,
        tags,
      })
      .select()
      .single()

    if (dbError) throw dbError
    router.push(`/patterns/${slug}`)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setIsUploading(true)

    try {
      const fileUrl = await uploadPatternFile()
      const imageUrl = await determineImageUrl()

      if (isEditing) {
        await updateExistingPattern(fileUrl, imageUrl)
      } else {
        await createNewPattern(fileUrl, imageUrl)
      }

      router.refresh()
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : `Failed to ${isEditing ? "update" : "create"} pattern`)
    } finally {
      setIsUploading(false)
      setUploadProgress("")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Pattern Details</CardTitle>
          <CardDescription>Tell us about your sewing pattern</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="title">Title *</FieldLabel>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Vintage A-Line Dress"
                maxLength={100}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="description">Description</FieldLabel>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your pattern, including sizing, materials needed, skill level details..."
                rows={5}
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel>Category</FieldLabel>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel>Difficulty *</FieldLabel>
                <Select value={difficulty} onValueChange={(v) => setDifficulty(v as Difficulty)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <Field>
              <FieldLabel>Tags</FieldLabel>
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add a tag..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleAddTag()
                    }
                  }}
                />
                <Button type="button" variant="secondary" onClick={handleAddTag}>
                  Add
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      {/* File Uploads */}
      <Card>
        <CardHeader>
          <CardTitle>Files</CardTitle>
          <CardDescription>
            {isEditing ? "Update your pattern file and preview image (optional)" : "Upload your pattern file and preview image"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Pattern File */}
          <Field>
            <FieldLabel>Pattern File {!isEditing && "*"}</FieldLabel>
            {isEditing && !patternFile && pattern?.file_name && (
              <div className="mb-4 rounded-lg bg-accent/10 p-4 text-sm">
                <p className="font-medium">Current file:</p>
                <p className="text-muted-foreground">{pattern.file_name}</p>
              </div>
            )}
            <div className="flex items-center gap-4">
              <label htmlFor="pattern-file" className="flex flex-1 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 p-8 transition-colors hover:border-primary/50 hover:bg-muted">
                <input
                  id="pattern-file"
                  type="file"
                  className="hidden"
                  accept=".pdf,.zip,.svg"
                  onChange={handlePatternChange}
                />
                <FileText className="mb-2 h-8 w-8 text-muted-foreground" />
                <span className="text-sm font-medium">
                  {patternFile ? patternFile.name : (isEditing ? "Click to upload new file or skip" : "Click to upload pattern file")}
                </span>
                <span className="text-xs text-muted-foreground">
                  PDF, ZIP, or SVG (max 50MB)
                </span>
              </label>
            </div>
          </Field>

          {/* Preview Image */}
          <Field>
            <FieldLabel>Preview Image (recommended)</FieldLabel>
            <div className="flex items-start gap-4">
              <label htmlFor="image-file" className="flex flex-1 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 p-8 transition-colors hover:border-primary/50 hover:bg-muted">
                <input
                  id="image-file"
                  type="file"
                  className="hidden"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleImageChange}
                />
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt={`Pattern preview for ${pattern?.title || 'pattern'}`}
                    className="h-32 w-auto rounded object-cover"
                  />
                ) : (
                  <>
                    <ImageIcon className="mb-2 h-8 w-8 text-muted-foreground" />
                    <span className="text-sm font-medium">Click to upload image</span>
                    <span className="text-xs text-muted-foreground">
                      JPEG, PNG, WebP, or GIF
                    </span>
                  </>
                )}
              </label>
              {imagePreview && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setImageFile(null)
                    setImagePreview(null)
                    setOriginalImageUrl(null)
                  }}
                  title="Remove image"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </Field>
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Submit */}
      <div className="flex items-center justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={isUploading}>
          {isUploading ? (
            <>
              <Spinner className="mr-2" />
              {uploadProgress || "Processing..."}
            </>
          ) : isEditing ? (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Update Pattern
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Share Pattern
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
