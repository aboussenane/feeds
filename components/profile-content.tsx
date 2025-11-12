"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Copy, Check, Eye, EyeOff, LogOut, Key, Code, Loader2, Trash2 } from "lucide-react"
import Link from "next/link"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

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
  dbUser,
  apiKey,
  feeds,
}: {
  user: { id: string; email?: string }
  dbUser: { id: string; username: string | null; lastUsernameChange: Date | null }
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
  const [username, setUsername] = useState(dbUser.username || "")
  const [editingUsername, setEditingUsername] = useState(false)
  const [usernameError, setUsernameError] = useState("")
  const [usernameLoading, setUsernameLoading] = useState(false)
  const [checkingUsername, setCheckingUsername] = useState(false)
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null)
  const [deletingFeed, setDeletingFeed] = useState<Feed | null>(null)
  const [deleteConfirmText, setDeleteConfirmText] = useState("")
  const [deleting, setDeleting] = useState(false)
  const baseUrl = typeof window !== "undefined" ? window.location.origin : ""

  // Calculate days until username can be changed again
  const getDaysUntilChange = () => {
    if (!dbUser.lastUsernameChange) return 0
    const daysSinceChange = (Date.now() - new Date(dbUser.lastUsernameChange).getTime()) / (1000 * 60 * 60 * 24)
    return Math.max(0, Math.ceil(7 - daysSinceChange))
  }

  const daysUntilChange = getDaysUntilChange()
  const canChangeUsername = daysUntilChange === 0

  // Sync username state when dbUser changes
  useEffect(() => {
    if (!editingUsername) {
      setUsername(dbUser.username || "")
      setUsernameAvailable(null)
      setUsernameError("")
    }
  }, [dbUser.username, editingUsername])

  // Check username availability as user types (debounced)
  useEffect(() => {
    if (!editingUsername || !username.trim()) {
      setUsernameAvailable(null)
      setUsernameError("")
      return
    }

    // Don't check if it's the current username (case-insensitive comparison)
    if (username.toLowerCase() === (dbUser.username || "").toLowerCase()) {
      setUsernameAvailable(true)
      setUsernameError("")
      return
    }

    // Validate format first
    if (!/^[a-zA-Z0-9_-]{3,20}$/.test(username)) {
      setUsernameAvailable(false)
      setUsernameError("Username must be 3-20 characters and contain only letters, numbers, underscores, and hyphens")
      return
    }

    // Debounce the API call
    const timeoutId = setTimeout(async () => {
      setCheckingUsername(true)
      setUsernameError("")
      
      try {
        const response = await fetch(`/api/username?username=${encodeURIComponent(username)}`)
        const data = await response.json()
        
        if (data.available) {
          setUsernameAvailable(true)
          setUsernameError("")
        } else {
          setUsernameAvailable(false)
          if (data.reason === "invalid_format") {
            setUsernameError("Username must be 3-20 characters and contain only letters, numbers, underscores, and hyphens")
          } else {
            setUsernameError("Username is already taken")
          }
        }
      } catch {
        // Silently fail - don't show error for network issues during typing
        setUsernameAvailable(null)
      } finally {
        setCheckingUsername(false)
      }
    }, 500) // 500ms debounce

    return () => clearTimeout(timeoutId)
  }, [username, editingUsername, dbUser.username])

  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleSignOut = async () => {
    await signOut()
    router.push("/login")
  }

  const handleDeleteFeed = async () => {
    if (!deletingFeed) return

    // Verify the user typed the correct feed name
    if (deleteConfirmText !== deletingFeed.title) {
      return
    }

    setDeleting(true)
    try {
      const response = await fetch(`/api/feeds/delete/${deletingFeed.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to delete feed")
      }

      // Refresh the page to update the feeds list
      router.refresh()
      setDeletingFeed(null)
      setDeleteConfirmText("")
    } catch (error) {
      console.error("Error deleting feed:", error)
      alert(error instanceof Error ? error.message : "Failed to delete feed. Please try again.")
    } finally {
      setDeleting(false)
    }
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

  const handleUpdateUsername = async () => {
    if (!username.trim()) {
      setUsernameError("Username is required")
      return
    }

    if (!/^[a-zA-Z0-9_-]{3,20}$/.test(username)) {
      setUsernameError("Username must be 3-20 characters and contain only letters, numbers, underscores, and hyphens")
      return
    }

    // Check availability one more time before submitting (case-insensitive comparison)
    if (username.toLowerCase() !== (dbUser.username || "").toLowerCase()) {
      try {
        const checkResponse = await fetch(`/api/username?username=${encodeURIComponent(username)}`)
        const checkData = await checkResponse.json()
        
        if (!checkData.available) {
          setUsernameError("Username is already taken")
          return
        }
      } catch {
        setUsernameError("Failed to verify username availability. Please try again.")
        return
      }
    }

    setUsernameLoading(true)
    setUsernameError("")

    try {
      const response = await fetch("/api/username", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to update username")
      }

      const data = await response.json()
      setUsername(data.username)
      setEditingUsername(false)
      router.refresh()
    } catch (error) {
      setUsernameError(error instanceof Error ? error.message : "Failed to update username")
    } finally {
      setUsernameLoading(false)
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
                  Returns: Created feed object with id, slug, and other fields. Feed URL: /feeds/[username]/[slug]
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
                  <strong>File size limit:</strong> Maximum 50MB for images and videos
                </p>
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

              {/* Create Post - URL */}
              <div>
                <p className="text-muted-foreground mb-2 text-xs font-semibold">Create URL Post:</p>
                <code className="text-xs bg-background p-2 rounded block mb-2">
                  POST {baseUrl}/api/posts
                </code>
                <pre className="text-xs bg-background p-2 rounded block overflow-x-auto">
{`curl -X POST ${baseUrl}/api/posts \\
  -H "Authorization: Bearer ${currentApiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "feedId": "your-feed-id",
    "type": "url",
    "url": "https://www.youtube.com/watch?v=...",
    "content": "Optional caption"
  }'`}
                </pre>
                <p className="text-xs text-muted-foreground mt-1">
                  Supports YouTube videos, images, videos, and any URL. The system will automatically detect and embed the content. Use &quot;url&quot; for the URL and &quot;content&quot; for an optional caption.
                </p>
              </div>

              {/* Edit Post - URL */}
              <div>
                <p className="text-muted-foreground mb-2 text-xs font-semibold">Update URL Post:</p>
                <code className="text-xs bg-background p-2 rounded block mb-2">
                  PATCH {baseUrl}/api/posts/[postId]
                </code>
                <pre className="text-xs bg-background p-2 rounded block overflow-x-auto">
{`curl -X PATCH ${baseUrl}/api/posts/your-post-id \\
  -H "Authorization: Bearer ${currentApiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "url": "https://www.youtube.com/watch?v=...",
    "content": "Updated caption",
    "type": "url"
  }'`}
                </pre>
                <p className="text-xs text-muted-foreground mt-1">
                  Note: Omit url to keep existing URL, omit content to keep existing caption.
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
        <CardContent className="space-y-4">
          <div>
            <Label>Email</Label>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
          <div>
            <Label>Username</Label>
            {editingUsername ? (
              <div className="space-y-2 mt-2">
                <div className="relative">
                  <Input
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value)
                      setUsernameError("")
                      setUsernameAvailable(null)
                    }}
                    placeholder="Enter username"
                    disabled={usernameLoading}
                    className={usernameError ? "border-destructive" : usernameAvailable === true ? "border-green-500" : ""}
                  />
                  {username.trim() && username.toLowerCase() !== (dbUser.username || "").toLowerCase() && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {checkingUsername ? (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      ) : usernameAvailable === true ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : usernameAvailable === false ? (
                        <span className="text-destructive text-sm">✕</span>
                      ) : null}
                    </div>
                  )}
                </div>
                {usernameError && (
                  <p className="text-sm text-destructive">{usernameError}</p>
                )}
                {!usernameError && username.trim() && username.toLowerCase() !== (dbUser.username || "").toLowerCase() && usernameAvailable === true && (
                  <p className="text-sm text-green-600">Username is available</p>
                )}
                {!canChangeUsername && (
                  <p className="text-xs text-muted-foreground">
                    You can only change your username once every 7 days. Please try again in {daysUntilChange} day{daysUntilChange === 1 ? "" : "s"}.
                  </p>
                )}
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleUpdateUsername}
                    disabled={usernameLoading || !canChangeUsername || checkingUsername || (usernameAvailable === false && username !== dbUser.username)}
                  >
                    {usernameLoading ? "Saving..." : "Save"}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingUsername(false)
                      setUsername(dbUser.username || "")
                      setUsernameError("")
                      setUsernameAvailable(null)
                    }}
                    disabled={usernameLoading}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2 mt-2">
                <p className="text-sm font-mono text-muted-foreground">
                  {dbUser.username || "Not set"}
                </p>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setEditingUsername(true)}
                  disabled={!canChangeUsername}
                >
                  {dbUser.username ? "Edit" : "Set Username"}
                </Button>
                {!canChangeUsername && (
                  <p className="text-xs text-muted-foreground">
                    You can change your username again in {daysUntilChange} day{daysUntilChange === 1 ? "" : "s"}.
                  </p>
                )}
              </div>
            )}
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
                                /feeds/{(dbUser.username || user.id)?.toLowerCase()}/{feed.slug}
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
                        <div className="flex gap-2">
                          <Link href={`/feeds/${(dbUser.username || user.id)?.toLowerCase()}/${feed.slug}`}>
                            <Button variant="outline" size="sm">
                              View Feed
                            </Button>
                          </Link>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setDeletingFeed(feed)}
                            className="gap-2"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Normal mode: Show simple feed info
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{feed.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {feed._count.posts} post{feed._count.posts === 1 ? "" : "s"} • /feeds/{(dbUser.username || user.id)?.toLowerCase()}/{feed.slug}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/feeds/${(dbUser.username || user.id)?.toLowerCase()}/${feed.slug}`}>
                          <Button variant="outline" size="sm">
                            View Feed
                          </Button>
                        </Link>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setDeletingFeed(feed)}
                          className="gap-2"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                      </div>
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

      {/* Delete Feed Confirmation Dialog */}
      <Dialog open={!!deletingFeed} onOpenChange={(open) => !open && setDeletingFeed(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Feed</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the feed and all its posts.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="delete-confirm">
                Type <strong>{deletingFeed?.title}</strong> to confirm deletion:
              </Label>
              <Input
                id="delete-confirm"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder={deletingFeed?.title}
                disabled={deleting}
                className="mt-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeletingFeed(null)
                setDeleteConfirmText("")
              }}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteFeed}
              disabled={deleting || deleteConfirmText !== deletingFeed?.title}
            >
              {deleting ? "Deleting..." : "Delete Feed"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

