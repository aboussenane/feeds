"use client"

import { Post } from "@prisma/client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import Image from "next/image"
import { formatDistanceToNow } from "date-fns"
import { Pencil, ExternalLink } from "lucide-react"
import { detectUrlType } from "@/lib/url-embed"

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
    <article id={`post-${post.id}`} itemScope itemType="https://schema.org/BlogPosting">
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
                  aria-label={`Edit post ${post.id}`}
                >
                  <Pencil className="h-3 w-3" />
                  Edit
                </Button>
              )}
            </div>
          )}
          <div className="space-y-4" itemProp="articleBody">
          {post.type === "text" && post.content && (
            <div className="prose prose-sm max-w-none">
              <p className="whitespace-pre-wrap" itemProp="text">{post.content}</p>
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
                itemProp="image"
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

          {post.type === "url" && post.url && (() => {
            const urlInfo = detectUrlType(post.url);
            
            if (urlInfo.type === "youtube" && urlInfo.embedUrl) {
              return (
                <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-transparent">
                  <iframe
                    src={urlInfo.embedUrl}
                    title="YouTube video player"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
              );
            }
            
            if (urlInfo.type === "image" && urlInfo.embedUrl) {
              return (
                <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-transparent">
                  <Image
                    src={urlInfo.embedUrl}
                    alt="Embedded image"
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
              );
            }
            
            if (urlInfo.type === "video" && urlInfo.embedUrl) {
              // Check if it's a Vimeo embed
              if (urlInfo.embedUrl.includes("vimeo.com")) {
                return (
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-transparent">
                    <iframe
                      src={urlInfo.embedUrl}
                      title="Vimeo video player"
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  </div>
                );
              }
              // Regular video file
              return (
                <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-transparent">
                  <video
                    src={urlInfo.embedUrl}
                    controls
                    className="w-full h-full object-contain"
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              );
            }
            
            // Generic link - show as clickable link
            return (
              <div className="space-y-2">
                <a
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 underline break-all"
                  style={{ color: styles?.fontColor || undefined }}
                >
                  {post.url}
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            );
          })()}

          {post.content && post.type !== "text" && (
            <p 
              className="text-sm whitespace-pre-wrap"
              style={{ color: styles?.secondaryTextColor || undefined }}
            >
              {post.content}
            </p>
          )}

          <time 
            className="text-xs"
            style={{ color: styles?.secondaryTextColor || undefined }}
            dateTime={new Date(post.createdAt).toISOString()}
            itemProp="datePublished"
          >
            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
          </time>
        </div>
      </CardContent>
    </Card>
    </article>
  )
}

