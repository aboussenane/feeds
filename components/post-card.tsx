"use client"

import { Post } from "@prisma/client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import Image from "next/image"
import { formatDistanceToNow } from "date-fns"
import { Pencil } from "lucide-react"

type PostCardStyles = {
  fontColor?: string | null
  secondaryTextColor?: string | null
  cardBgColor?: string | null
  cardBorderColor?: string | null
}

export function PostCard({ 
  post, 
  styles,
  isOwner,
  onEdit
}: { 
  post: Post
  styles?: PostCardStyles
  isOwner?: boolean
  onEdit?: (post: Post) => void
}) {
  const cardStyle: React.CSSProperties = {
    backgroundColor: styles?.cardBgColor || undefined,
    borderColor: styles?.cardBorderColor || undefined,
    color: styles?.fontColor || undefined,
  }

  return (
    <Card style={cardStyle}>
      <CardContent className="p-6">
        {isOwner && (
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Label className="text-xs" style={{ color: styles?.secondaryTextColor || undefined }}>
                Post ID:
              </Label>
              <code className="text-xs font-mono bg-muted px-2 py-1 rounded" style={{ color: styles?.fontColor || undefined }}>
                {post.id}
              </code>
            </div>
            {onEdit && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onEdit(post)}
                className="gap-2"
              >
                <Pencil className="h-3 w-3" />
                Edit
              </Button>
            )}
          </div>
        )}
        <div className="space-y-4">
          {post.type === "text" && post.content && (
            <div className="prose prose-sm max-w-none">
              <p className="whitespace-pre-wrap">{post.content}</p>
            </div>
          )}

          {post.type === "image" && post.imageUrl && (
            <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-transparent">
              <Image
                src={post.imageUrl}
                alt={post.content || "Post image"}
                fill
                className="object-contain"
                unoptimized
              />
            </div>
          )}

          {post.type === "video" && post.videoUrl && (
            <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-transparent">
              <video
                src={post.videoUrl}
                controls
                className="w-full h-full object-contain"
              >
                Your browser does not support the video tag.
              </video>
            </div>
          )}

          {post.content && post.type !== "text" && (
            <p 
              className="text-sm whitespace-pre-wrap"
              style={{ color: styles?.secondaryTextColor || undefined }}
            >
              {post.content}
            </p>
          )}

          <div 
            className="text-xs"
            style={{ color: styles?.secondaryTextColor || undefined }}
          >
            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

