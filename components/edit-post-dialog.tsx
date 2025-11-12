"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Post } from "@prisma/client"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { X } from "lucide-react"
import { isValidUrl } from "@/lib/url-embed"

type EditPostDialogProps = {
  post: Post
  open: boolean
  onOpenChange: (open: boolean) => void
  onPostUpdated: (post: Post) => void
}

export function EditPostDialog({
  post,
  open,
  onOpenChange,
  onPostUpdated,
}: EditPostDialogProps) {
  const [type, setType] = useState<"text" | "image" | "video" | "url">(post.type as "text" | "image" | "video" | "url")
  const [content, setContent] = useState(post.content || "")
  type PostWithUrl = typeof post & { url?: string | null }
  const postWithUrl = post as PostWithUrl
  const [url, setUrl] = useState(postWithUrl.url || "") // URL for URL type posts
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(post.imageUrl)
  const [videoPreview, setVideoPreview] = useState<string | null>(post.videoUrl)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState<string>("")

  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

  // Reset form when post changes or dialog opens
  useEffect(() => {
    if (open && post) {
      setType(post.type as "text" | "image" | "video" | "url")
      setContent(post.content || "")
      setUrl(postWithUrl.url || "")
      setImagePreview(post.imageUrl)
      setVideoPreview(post.videoUrl)
      setImageFile(null)
      setVideoFile(null)
      setError("")
      setUploadProgress(0)
      setUploadStatus("")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, post])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileType: "image" | "video") => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size before processing
    if (file.size > MAX_FILE_SIZE) {
      const fileSizeMB = (file.size / 1024 / 1024).toFixed(2)
      setError(`File size (${fileSizeMB}MB) exceeds the maximum allowed size of 50MB. Please choose a smaller file.`)
      // Reset the input
      e.target.value = ""
      // Clear any previews
      if (fileType === "image") {
        setImageFile(null)
        setImagePreview(post.imageUrl) // Restore original preview
      } else {
        setVideoFile(null)
        setVideoPreview(post.videoUrl) // Restore original preview
      }
      return
    }

    // Clear any previous errors
    setError("")

    if (fileType === "image") {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setVideoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setVideoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadFile = async (file: File, fileType: "image" | "video"): Promise<string> => {
    setUploadStatus(`Uploading ${fileType}...`)
    setUploadProgress(0)

    // Use XMLHttpRequest for progress tracking on all uploads
    return new Promise<string>((resolve, reject) => {
      const formData = new FormData()
      formData.append("file", file)

      const xhr = new XMLHttpRequest()

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const percent = (e.loaded / e.total) * 100
          setUploadProgress(percent)
        }
      })

      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText)
            if (!response.url) {
              reject(new Error("No URL returned from upload"))
              return
            }
            setUploadProgress(100)
            setUploadStatus("")
            resolve(response.url)
          } catch {
            reject(new Error("Failed to parse upload response"))
          }
        } else {
          try {
            const errorData = JSON.parse(xhr.responseText)
            reject(new Error(errorData.error || `Upload failed with status ${xhr.status}`))
          } catch {
            reject(new Error(`Upload failed with status ${xhr.status}`))
          }
        }
      })

      xhr.addEventListener("error", () => {
        reject(new Error("Upload failed"))
      })

      xhr.open("POST", "/api/upload")
      xhr.send(formData)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setUploadProgress(0)
    setUploadStatus("")

    try {
      // Validate URL for URL posts
      if (type === "url") {
        const urlToValidate = url || postWithUrl.url
        if (!urlToValidate) {
          setError("URL is required")
          setLoading(false)
          return
        }
        if (url && !isValidUrl(url)) {
          setError("Please enter a valid URL (must start with http:// or https://)")
          setLoading(false)
          return
        }
      }

      let imageUrl: string | null = post.imageUrl
      let videoUrl: string | null = post.videoUrl

      // Upload new file if provided
      if (type === "image" && imageFile) {
        imageUrl = await uploadFile(imageFile, "image")
      }

      if (type === "video" && videoFile) {
        videoUrl = await uploadFile(videoFile, "video")
      }

      // Update post
      const response = await fetch(`/api/posts/${post.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: content || null,
          url: type === "url" ? (url || null) : null,
          imageUrl,
          videoUrl,
          type,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to update post")
      }

      const updatedPost = await response.json()
      onPostUpdated(updatedPost)

      // Reset form
      setContent("")
      setUrl("")
      setImageFile(null)
      setVideoFile(null)
      setImagePreview(null)
      setVideoPreview(null)
      setUploadProgress(0)
      setUploadStatus("")
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      setUploadProgress(0)
      setUploadStatus("")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      onOpenChange(false)
      // Reset form when closing
      setTimeout(() => {
        setContent(post.content || "")
        setUrl(postWithUrl.url || "")
        setImageFile(null)
        setVideoFile(null)
        setImagePreview(post.imageUrl)
        setVideoPreview(post.videoUrl)
        setType(post.type as "text" | "image" | "video" | "url")
        setError("")
        setUploadProgress(0)
        setUploadStatus("")
      }, 200)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Post</DialogTitle>
          <DialogDescription>
            Update your post content
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>Post Type</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={type === "text" ? "default" : "outline"}
                onClick={() => setType("text")}
                size="sm"
              >
                Text
              </Button>
              <Button
                type="button"
                variant={type === "image" ? "default" : "outline"}
                onClick={() => setType("image")}
                size="sm"
              >
                Image
              </Button>
              <Button
                type="button"
                variant={type === "video" ? "default" : "outline"}
                onClick={() => setType("video")}
                size="sm"
              >
                Video
              </Button>
              <Button
                type="button"
                variant={type === "url" ? "default" : "outline"}
                onClick={() => setType("url")}
                size="sm"
              >
                URL
              </Button>
            </div>
          </div>

          {type === "text" && (
            <div className="space-y-2">
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your post content..."
                rows={6}
                required
              />
            </div>
          )}

          {type === "image" && (
            <div className="space-y-2">
              <Label htmlFor="image">Image {!post.imageUrl && "*"}</Label>
              <p className="text-xs text-muted-foreground">
                {post.imageUrl ? "Leave empty to keep current image" : "Upload an image"}
              </p>
              <p className="text-xs text-muted-foreground">
                Maximum file size: 50MB
              </p>
              <div className="space-y-2">
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, "image")}
                />
                {imagePreview && (
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden border">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      fill
                      className="object-contain"
                      unoptimized
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setImageFile(null)
                        setImagePreview(null)
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="image-content">Caption (optional)</Label>
                <Textarea
                  id="image-content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Add a caption..."
                  rows={3}
                />
              </div>
            </div>
          )}

          {type === "video" && (
            <div className="space-y-2">
              <Label htmlFor="video">Video {!post.videoUrl && "*"}</Label>
              <p className="text-xs text-muted-foreground">
                {post.videoUrl ? "Leave empty to keep current video" : "Upload a video"}
              </p>
              <p className="text-xs text-muted-foreground">
                Maximum file size: 50MB
              </p>
              <div className="space-y-2">
                <Input
                  id="video"
                  type="file"
                  accept="video/*"
                  onChange={(e) => handleFileChange(e, "video")}
                />
                {videoPreview && (
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden border">
                    <video
                      src={videoPreview}
                      controls
                      className="w-full h-full object-contain"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setVideoFile(null)
                        setVideoPreview(null)
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="video-content">Caption (optional)</Label>
                <Textarea
                  id="video-content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Add a caption..."
                  rows={3}
                />
              </div>
            </div>
          )}

          {type === "url" && (
            <div className="space-y-2">
              <Label htmlFor="url">URL {!postWithUrl.url && "*"}</Label>
              <p className="text-xs text-muted-foreground">
                {postWithUrl.url ? "Leave empty to keep current URL" : "Paste a URL to embed (YouTube, images, videos, or any link)"}
              </p>
              <Input
                id="url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
              />
              <div className="space-y-2">
                <Label htmlFor="url-content">Caption (optional)</Label>
                <Textarea
                  id="url-content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Add a caption..."
                  rows={3}
                />
              </div>
            </div>
          )}

          {(uploadProgress > 0 || uploadStatus) && (
            <div className="space-y-2">
              {uploadStatus && (
                <p className="text-sm text-muted-foreground">{uploadStatus}</p>
              )}
              <Progress value={uploadProgress} className="w-full" />
              <p className="text-xs text-muted-foreground text-right">
                {Math.round(uploadProgress)}%
              </p>
            </div>
          )}

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (uploadProgress > 0 ? "Uploading..." : "Updating...") : "Update Post"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

