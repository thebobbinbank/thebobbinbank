"use client"

import { BlobAvatarImage } from "@/components/blob-avatar-image"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import type { Comment } from "@/lib/types"
import type { User } from "@supabase/supabase-js"
import { MessageSquare, Reply } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface CommentSectionProps {
  patternId: string
  comments: Comment[]
  user: User | null
}

function CommentItem({
  comment,
  patternId,
  user,
  isReply = false,
}: {
  comment: Comment
  patternId: string
  user: User | null
  isReply?: boolean
}) {
  const router = useRouter()
  const supabase = createClient()

  const [showReplyForm, setShowReplyForm] = useState(false)
  const [replyContent, setReplyContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const commenterName = comment.profiles?.display_name || "Anonymous"
  const commenterInitials = commenterName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  const commentDate = new Date(comment.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !replyContent.trim()) return

    setIsSubmitting(true)

    try {
      const { error } = await supabase.from("comments").insert({
        pattern_id: patternId,
        user_id: user.id,
        parent_id: comment.id,
        content: replyContent.trim(),
      })

      if (error) throw error

      setReplyContent("")
      setShowReplyForm(false)
      router.refresh()
    } catch (err) {
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={isReply ? "ml-12 mt-3" : ""}>
      <div className="flex gap-3">
        <Avatar className={isReply ? "h-8 w-8" : "h-10 w-10"}>
          <BlobAvatarImage src={comment.profiles?.avatar_url} />
          <AvatarFallback className="bg-secondary text-sm">{commenterInitials}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="mb-1 flex items-center gap-2">
            <span className="font-medium text-sm">{commenterName}</span>
            <span className="text-xs text-muted-foreground">{commentDate}</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{comment.content}</p>
          {user && !isReply && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-1 -ml-2 h-8 text-xs"
              onClick={() => setShowReplyForm(!showReplyForm)}
            >
              <Reply className="mr-1 h-3 w-3" />
              Reply
            </Button>
          )}
        </div>
      </div>

      {showReplyForm && (
        <form onSubmit={handleReply} className="ml-12 mt-3 space-y-2">
          <Textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Write a reply..."
            rows={2}
            className="text-sm"
          />
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={isSubmitting || !replyContent.trim()}>
              {isSubmitting && <Spinner className="mr-2" />}
              Reply
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowReplyForm(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="space-y-3">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              patternId={patternId}
              user={user}
              isReply
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function CommentSection({ patternId, comments, user }: CommentSectionProps) {
  const router = useRouter()
  const supabase = createClient()

  const [newComment, setNewComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !newComment.trim()) return

    setIsSubmitting(true)

    try {
      const { error } = await supabase.from("comments").insert({
        pattern_id: patternId,
        user_id: user.id,
        content: newComment.trim(),
      })

      if (error) throw error

      setNewComment("")
      router.refresh()
    } catch (err) {
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-2">
        <MessageSquare className="h-5 w-5" />
        <h2 className="text-xl font-semibold">
          Comments ({comments.length})
        </h2>
      </div>

      {/* Comment Form */}
      {user ? (
        <form onSubmit={handleSubmit} className="mb-6 space-y-3">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your thoughts or ask a question..."
            rows={3}
          />
          <Button type="submit" disabled={isSubmitting || !newComment.trim()}>
            {isSubmitting && <Spinner className="mr-2" />}
            Post Comment
          </Button>
        </form>
      ) : (
        <Card className="mb-6">
          <CardContent className="py-6 text-center">
            <p className="text-muted-foreground">
              <Link href="/auth/login" className="text-primary hover:underline">
                Sign in
              </Link>{" "}
              to join the conversation
            </p>
          </CardContent>
        </Card>
      )}

      {/* Comments List */}
      <div className="space-y-6">
        {comments.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">
            No comments yet. Start the conversation!
          </p>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              patternId={patternId}
              user={user}
            />
          ))
        )}
      </div>
    </div>
  )
}
