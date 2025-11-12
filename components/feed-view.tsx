"use client"

import { useState } from "react"
import { Post } from "@prisma/client"
import { Feed } from "@prisma/client"
import { PostCard } from "./post-card"
import { CreatePostDialog } from "./create-post-dialog"
import { EditPostDialog } from "./edit-post-dialog"
import { FeedStyleEditor } from "./feed-style-editor"
import { useFeedStyles } from "@/context/feed-styles-context"
import { Button } from "@/components/ui/button"
import { Plus, Palette } from "lucide-react"

type FeedWithPosts = Feed & {
  posts: Post[]
  fontFamily: string | null
  fontColor: string | null
  secondaryTextColor: string | null
  cardBgColor: string | null
  cardBorderColor: string | null
  feedBgColor: string | null
  buttonColor: string | null
  buttonSecondaryColor: string | null
}

type FeedStyles = {
  fontFamily?: string | null
  fontColor?: string | null
  secondaryTextColor?: string | null
  cardBgColor?: string | null
  cardBorderColor?: string | null
  feedBgColor?: string | null
  buttonColor?: string | null
  buttonSecondaryColor?: string | null
}

export function FeedView({ 
  feed, 
  isOwner = false 
}: { 
  feed: FeedWithPosts
  isOwner?: boolean 
}) {
  const [posts, setPosts] = useState(feed.posts)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isStyleEditorOpen, setIsStyleEditorOpen] = useState(false)
  const [editingPost, setEditingPost] = useState<Post | null>(null)
  const { styles: contextStyles, setStyles: setContextStyles } = useFeedStyles()
  
  // Use context styles if available, otherwise fall back to feed styles
  const [styles, setStyles] = useState<FeedStyles>(
    contextStyles || {
      fontFamily: feed.fontFamily,
      fontColor: feed.fontColor,
      secondaryTextColor: feed.secondaryTextColor,
      cardBgColor: feed.cardBgColor,
      cardBorderColor: feed.cardBorderColor,
      feedBgColor: feed.feedBgColor,
      buttonColor: feed.buttonColor,
      buttonSecondaryColor: feed.buttonSecondaryColor,
    }
  )

  const handlePostCreated = (newPost: Post) => {
    setPosts([newPost, ...posts])
    setIsDialogOpen(false)
  }

  const handlePostUpdated = (updatedPost: Post) => {
    setPosts(posts.map(p => p.id === updatedPost.id ? updatedPost : p))
    setEditingPost(null)
  }

  const handleEditPost = (post: Post) => {
    setEditingPost(post)
  }

  const handleStylesUpdated = (updatedStyles: FeedStyles) => {
    setStyles(updatedStyles)
    setContextStyles(updatedStyles)
  }

  return (
    <div className="space-y-6">
      {isOwner && (
        <div className="flex justify-end gap-2">
          <Button 
            onClick={() => setIsStyleEditorOpen(true)} 
            variant="outline"
            className="gap-2"
            style={{
              backgroundColor: styles.buttonSecondaryColor || undefined,
              color: styles.fontColor || undefined,
              borderColor: styles.buttonSecondaryColor || undefined,
            }}
          >
            <Palette className="h-4 w-4" />
            Customize Styles
          </Button>
          <Button 
            onClick={() => setIsDialogOpen(true)} 
            className="gap-2"
            style={{
              backgroundColor: styles.buttonColor || undefined,
              color: styles.fontColor || undefined,
            }}
          >
            <Plus className="h-4 w-4" />
            Add Post
          </Button>
        </div>
      )}

      {posts.length === 0 ? (
        <div 
          className="text-center py-12 border rounded-lg"
          style={{
            borderColor: styles.cardBorderColor || undefined,
          }}
        >
          <p 
            className="mb-4"
            style={{ color: styles.secondaryTextColor || undefined }}
          >
            No posts yet
          </p>
          {isOwner && (
            <Button 
              onClick={() => setIsDialogOpen(true)} 
              variant="outline"
              style={{
                borderColor: styles.buttonSecondaryColor || undefined,
                color: styles.buttonSecondaryColor || undefined,
              }}
            >
              Create your first post
            </Button>
          )}
        </div>
      ) : (
        <section className="space-y-4" aria-label="Feed posts">
          {posts.map((post) => (
            <PostCard 
              key={post.id} 
              post={post}
              isOwner={isOwner}
              onEdit={isOwner ? handleEditPost : undefined}
              styles={{
                fontColor: styles.fontColor,
                secondaryTextColor: styles.secondaryTextColor,
                cardBgColor: styles.cardBgColor,
                cardBorderColor: styles.cardBorderColor,
              }}
            />
          ))}
        </section>
      )}

      {isOwner && (
        <>
          <CreatePostDialog
            feedId={feed.id}
            open={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            onPostCreated={handlePostCreated}
          />
          {editingPost && (
            <EditPostDialog
              post={editingPost}
              open={!!editingPost}
              onOpenChange={(open) => !open && setEditingPost(null)}
              onPostUpdated={handlePostUpdated}
            />
          )}
          <FeedStyleEditor
            feedId={feed.id}
            open={isStyleEditorOpen}
            onOpenChange={setIsStyleEditorOpen}
            currentStyles={styles}
            onStylesUpdated={handleStylesUpdated}
          />
        </>
      )}
    </div>
  )
}

