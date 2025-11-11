"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Copy, Check, Eye, EyeOff, LogOut, Key, Code } from "lucide-react"
import Link from "next/link"

type Feed = {
  id: string
  title: string
  slug: string
  createdAt: Date
  _count: {
    posts: number
  }
}

export function ProfileContent({
  user,
  apiKey,
  feeds,
}: {
  user: { id: string; email?: string }
  apiKey: string
  feeds: Feed[]
}) {
  const router = useRouter()
  const { signOut } = useAuth()
  const [keyVisible, setKeyVisible] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [developerMode, setDeveloperMode] = useState(false)
  const [currentApiKey, setCurrentApiKey] = useState(apiKey)
  const [regenerating, setRegenerating] = useState(false)
  const baseUrl = typeof window !== "undefined" ? window.location.origin : ""

  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleSignOut = async () => {
    await signOut()
    router.push("/login")
  }

  const handleRegenerateApiKey = async () => {
    if (!confirm("Are you sure you want to regenerate your API key? Your old key will be invalidated immediately.")) {
      return
    }

    setRegenerating(true)
    try {
      const response = await fetch("/api/api-key", {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to regenerate API key")
      }

      const data = await response.json()
      setCurrentApiKey(data.key)
      setKeyVisible(true) // Show the new key
      setCopied("api-key")
      setTimeout(() => setCopied(null), 2000)
    } catch (error) {
      console.error("Error regenerating API key:", error)
      alert("Failed to regenerate API key. Please try again.")
    } finally {
      setRegenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Profile Settings</h1>
          <p className="text-muted-foreground">
            Manage your account and preferences
          </p>
        </div>
        <Button
          type="button"
          variant={developerMode ? "default" : "outline"}
          onClick={() => setDeveloperMode(!developerMode)}
          className="gap-2"
        >
          <Code className="h-4 w-4" />
          Developer Mode
        </Button>
      </div>

      {/* API Key Section - Only show in developer mode */}
      {developerMode && (
        <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            <CardTitle>API Access</CardTitle>
          </div>
          <CardDescription>
            Use this API key to programmatically create posts and manage feeds
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>API Key</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRegenerateApiKey}
                disabled={regenerating}
              >
                {regenerating ? "Regenerating..." : "Regenerate"}
              </Button>
            </div>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Input
                  type={keyVisible ? "text" : "password"}
                  value={currentApiKey}
                  readOnly
                  className="font-mono text-sm pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full"
                  onClick={() => setKeyVisible(!keyVisible)}
                >
                  {keyVisible ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleCopy(currentApiKey, "api-key")}
              >
                {copied === "api-key" ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              ⚠️ Regenerating your API key will immediately invalidate your old key. Make sure to update any applications using it.
            </p>
          </div>

          <div className="space-y-4 p-4 bg-muted rounded-lg">
            <h3 className="font-semibold text-sm">API Endpoints</h3>
            
            <div className="space-y-4">
              {/* Get Feeds */}
              <div>
                <p className="text-muted-foreground mb-2 text-xs font-semibold">Get Your Feeds:</p>
                <code className="text-xs bg-background p-2 rounded block mb-2">
                  GET {baseUrl}/api/feeds
                </code>
                <pre className="text-xs bg-background p-2 rounded block overflow-x-auto">
{`curl -X GET ${baseUrl}/api/feeds \\
  -H "Authorization: Bearer ${currentApiKey}"`}
                </pre>
                <p className="text-xs text-muted-foreground mt-1">
                  Returns: Array of your feeds with all posts. Requires authentication.
                </p>
              </div>

              {/* Create Feed */}
              <div>
                <p className="text-muted-foreground mb-2 text-xs font-semibold">Create Feed:</p>
                <code className="text-xs bg-background p-2 rounded block mb-2">
                  POST {baseUrl}/api/feeds
                </code>
                <pre className="text-xs bg-background p-2 rounded block overflow-x-auto">
{`curl -X POST ${baseUrl}/api/feeds \\
  -H "Authorization: Bearer ${currentApiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "My New Feed",
    "description": "Optional description"
  }'`}
                </pre>
                <p className="text-xs text-muted-foreground mt-1">
                  Returns: Created feed object with id, slug, and other fields. Feed URL: /feeds/[userId]/[slug]
                </p>
              </div>

              {/* Upload Endpoint */}
              <div>
                <p className="text-muted-foreground mb-2 text-xs font-semibold">Upload File:</p>
                <code className="text-xs bg-background p-2 rounded block mb-2">
                  POST {baseUrl}/api/upload
                </code>
                <pre className="text-xs bg-background p-2 rounded block overflow-x-auto">
{`curl -X POST ${baseUrl}/api/upload \\
  -H "Authorization: Bearer ${currentApiKey}" \\
  -F "file=@/path/to/image.jpg"`}
                </pre>
                <p className="text-xs text-muted-foreground mt-1">
                  Returns: {"{ \"url\": \"https://...\" }"}
                </p>
              </div>

              {/* Create Post - Text */}
              <div>
                <p className="text-muted-foreground mb-2 text-xs font-semibold">Create Text Post:</p>
                <code className="text-xs bg-background p-2 rounded block mb-2">
                  POST {baseUrl}/api/posts
                </code>
                <pre className="text-xs bg-background p-2 rounded block overflow-x-auto">
{`curl -X POST ${baseUrl}/api/posts \\
  -H "Authorization: Bearer ${currentApiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "feedId": "your-feed-id",
    "type": "text",
    "content": "Hello from API!"
  }'`}
                </pre>
              </div>

              {/* Create Post - Image */}
              <div>
                <p className="text-muted-foreground mb-2 text-xs font-semibold">Create Image Post:</p>
                <p className="text-xs text-muted-foreground mb-2">
                  Step 1: Upload the image
                </p>
                <pre className="text-xs bg-background p-2 rounded block overflow-x-auto mb-2">
{`UPLOAD_RESPONSE=$(curl -X POST ${baseUrl}/api/upload \\
  -H "Authorization: Bearer ${currentApiKey}" \\
  -F "file=@/path/to/image.jpg")

IMAGE_URL=$(echo $UPLOAD_RESPONSE | jq -r '.url')`}
                </pre>
                <p className="text-xs text-muted-foreground mb-2">
                  Step 2: Create post with image URL
                </p>
                <pre className="text-xs bg-background p-2 rounded block overflow-x-auto">
{`curl -X POST ${baseUrl}/api/posts \\
  -H "Authorization: Bearer ${currentApiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "feedId": "your-feed-id",
    "type": "image",
    "imageUrl": "$IMAGE_URL",
    "content": "Optional caption"
  }'`}
                </pre>
              </div>

              {/* Create Post - Video */}
              <div>
                <p className="text-muted-foreground mb-2 text-xs font-semibold">Create Video Post:</p>
                <p className="text-xs text-muted-foreground mb-2">
                  Step 1: Upload the video
                </p>
                <pre className="text-xs bg-background p-2 rounded block overflow-x-auto mb-2">
{`UPLOAD_RESPONSE=$(curl -X POST ${baseUrl}/api/upload \\
  -H "Authorization: Bearer ${currentApiKey}" \\
  -F "file=@/path/to/video.mp4")

VIDEO_URL=$(echo $UPLOAD_RESPONSE | jq -r '.url')`}
                </pre>
                <p className="text-xs text-muted-foreground mb-2">
                  Step 2: Create post with video URL
                </p>
                <pre className="text-xs bg-background p-2 rounded block overflow-x-auto">
{`curl -X POST ${baseUrl}/api/posts \\
  -H "Authorization: Bearer ${currentApiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "feedId": "your-feed-id",
    "type": "video",
    "videoUrl": "$VIDEO_URL",
    "content": "Optional caption"
  }'`}
                </pre>
              </div>

              {/* Edit Post - Text */}
              <div>
                <p className="text-muted-foreground mb-2 text-xs font-semibold">Update Text Post:</p>
                <code className="text-xs bg-background p-2 rounded block mb-2">
                  PATCH {baseUrl}/api/posts/[postId]
                </code>
                <pre className="text-xs bg-background p-2 rounded block overflow-x-auto">
{`curl -X PATCH ${baseUrl}/api/posts/your-post-id \\
  -H "Authorization: Bearer ${currentApiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "content": "Updated content",
    "type": "text"
  }'`}
                </pre>
              </div>

              {/* Edit Post - Image */}
              <div>
                <p className="text-muted-foreground mb-2 text-xs font-semibold">Update Image Post:</p>
                <p className="text-xs text-muted-foreground mb-2">
                  Step 1: Upload new image (optional - omit to keep existing)
                </p>
                <pre className="text-xs bg-background p-2 rounded block overflow-x-auto mb-2">
{`UPLOAD_RESPONSE=$(curl -X POST ${baseUrl}/api/upload \\
  -H "Authorization: Bearer ${currentApiKey}" \\
  -F "file=@/path/to/new-image.jpg")

NEW_IMAGE_URL=$(echo $UPLOAD_RESPONSE | jq -r '.url')`}
                </pre>
                <p className="text-xs text-muted-foreground mb-2">
                  Step 2: Update post with new image URL
                </p>
                <pre className="text-xs bg-background p-2 rounded block overflow-x-auto">
{`curl -X PATCH ${baseUrl}/api/posts/your-post-id \\
  -H "Authorization: Bearer ${currentApiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "imageUrl": "$NEW_IMAGE_URL",
    "content": "Updated caption"
  }'`}
                </pre>
                <p className="text-xs text-muted-foreground mt-1">
                  Note: Omit imageUrl to keep existing image, only update caption.
                </p>
              </div>

              {/* Edit Post - Video */}
              <div>
                <p className="text-muted-foreground mb-2 text-xs font-semibold">Update Video Post:</p>
                <p className="text-xs text-muted-foreground mb-2">
                  Step 1: Upload new video (optional - omit to keep existing)
                </p>
                <pre className="text-xs bg-background p-2 rounded block overflow-x-auto mb-2">
{`UPLOAD_RESPONSE=$(curl -X POST ${baseUrl}/api/upload \\
  -H "Authorization: Bearer ${currentApiKey}" \\
  -F "file=@/path/to/new-video.mp4")

NEW_VIDEO_URL=$(echo $UPLOAD_RESPONSE | jq -r '.url')`}
                </pre>
                <p className="text-xs text-muted-foreground mb-2">
                  Step 2: Update post with new video URL
                </p>
                <pre className="text-xs bg-background p-2 rounded block overflow-x-auto">
{`curl -X PATCH ${baseUrl}/api/posts/your-post-id \\
  -H "Authorization: Bearer ${currentApiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "videoUrl": "$NEW_VIDEO_URL",
    "content": "Updated caption"
  }'`}
                </pre>
                <p className="text-xs text-muted-foreground mt-1">
                  Note: Omit videoUrl to keep existing video, only update caption.
                </p>
              </div>

              {/* Delete Post */}
              <div>
                <p className="text-muted-foreground mb-2 text-xs font-semibold">Delete Post:</p>
                <code className="text-xs bg-background p-2 rounded block mb-2">
                  DELETE {baseUrl}/api/posts/[postId]
                </code>
                <pre className="text-xs bg-background p-2 rounded block overflow-x-auto">
{`curl -X DELETE ${baseUrl}/api/posts/your-post-id \\
  -H "Authorization: Bearer ${currentApiKey}"`}
                </pre>
                <p className="text-xs text-muted-foreground mt-1">
                  Returns: {"{ \"success\": true }"}
                </p>
              </div>

              {/* Common Headers */}
              <div className="pt-2 border-t">
                <p className="text-muted-foreground mb-1 text-xs font-semibold">Required Headers:</p>
                <code className="text-xs bg-background p-2 rounded block">
                  {`Authorization: Bearer ${currentApiKey}`}
                </code>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      )}

      {/* User Info */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <Label>Email</Label>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
          <div>
            <Label>User ID</Label>
            <p className="text-sm font-mono text-muted-foreground">{user.id}</p>
          </div>
        </CardContent>
      </Card>

      {/* Feeds */}
      <Card>
        <CardHeader>
          <CardTitle>Your Feeds</CardTitle>
          <CardDescription>
            {feeds.length === 0
              ? "You haven't created any feeds yet"
              : `${feeds.length} feed${feeds.length === 1 ? "" : "s"}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {feeds.length === 0 ? (
            <Link href="/feeds/new">
              <Button variant="outline">Create Your First Feed</Button>
            </Link>
          ) : (
            <div className="space-y-3">
              {feeds.map((feed) => (
                <div
                  key={feed.id}
                  className="p-4 border rounded-lg"
                >
                  {developerMode ? (
                    // Developer mode: Show detailed info with IDs
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{feed.title}</h3>
                          </div>
                          <div className="space-y-1.5">
                            <div>
                              <Label className="text-xs text-muted-foreground">Feed ID</Label>
                              <div className="flex items-center gap-2 mt-0.5">
                                <code className="text-xs font-mono bg-muted px-2 py-1 rounded">
                                  {feed.id}
                                </code>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => handleCopy(feed.id, `feed-${feed.id}`)}
                                >
                                  {copied === `feed-${feed.id}` ? (
                                    <Check className="h-3 w-3" />
                                  ) : (
                                    <Copy className="h-3 w-3" />
                                  )}
                                </Button>
                              </div>
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Feed Name</Label>
                              <p className="text-sm mt-0.5">{feed.title}</p>
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">URL</Label>
                              <p className="text-sm text-muted-foreground mt-0.5">
                                /feeds/{user.id}/{feed.slug}
                              </p>
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Posts</Label>
                              <p className="text-sm text-muted-foreground mt-0.5">
                                {feed._count.posts} post{feed._count.posts === 1 ? "" : "s"}
                              </p>
                            </div>
                          </div>
                        </div>
                        <Link href={`/feeds/${user.id}/${feed.slug}`}>
                          <Button variant="outline" size="sm">
                            View Feed
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ) : (
                    // Normal mode: Show simple feed info
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{feed.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {feed._count.posts} post{feed._count.posts === 1 ? "" : "s"} • /feeds/{user.id}/{feed.slug}
                        </p>
                      </div>
                      <Link href={`/feeds/${user.id}/${feed.slug}`}>
                        <Button variant="outline" size="sm">
                          View Feed
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sign Out */}
      <Card>
        <CardContent className="pt-6">
          <Button variant="destructive" onClick={handleSignOut} className="gap-2">
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

