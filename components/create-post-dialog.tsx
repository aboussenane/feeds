"use client"

import { useState } from "react"
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

type CreatePostDialogProps = {
  feedId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onPostCreated: (post: Post) => void
}

export function CreatePostDialog({
  feedId,
  open,
  onOpenChange,
  onPostCreated,
}: CreatePostDialogProps) {
  const [type, setType] = useState<"text" | "image" | "video">("text")
  const [content, setContent] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [videoPreview, setVideoPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState<string>("")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileType: "image" | "video") => {
    const file = e.target.files?.[0]
    if (!file) return

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
      let imageUrl: string | null = null
      let videoUrl: string | null = null

      // Upload file if needed
      if (type === "image" && imageFile) {
        imageUrl = await uploadFile(imageFile, "image")
      }

      if (type === "video" && videoFile) {
        videoUrl = await uploadFile(videoFile, "video")
      }

      // Create post
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          feedId,
          content: content || null,
          imageUrl,
          videoUrl,
          type,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to create post")
      }

      const post = await response.json()
      onPostCreated(post)

      // Reset form
      setContent("")
      setImageFile(null)
      setVideoFile(null)
      setImagePreview(null)
      setVideoPreview(null)
      setType("text")
      setUploadProgress(0)
      setUploadStatus("")
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
        setContent("")
        setImageFile(null)
        setVideoFile(null)
        setImagePreview(null)
        setVideoPreview(null)
        setType("text")
        setError("")
      }, 200)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Post</DialogTitle>
          <DialogDescription>
            Add a new post to your feed
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
              <Label htmlFor="image">Image *</Label>
              <div className="space-y-2">
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, "image")}
                  required
                />
                {imagePreview && (
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden border">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-contain"
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
              <Label htmlFor="video">Video *</Label>
              <div className="space-y-2">
                <Input
                  id="video"
                  type="file"
                  accept="video/*"
                  onChange={(e) => handleFileChange(e, "video")}
                  required
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
              {loading ? (uploadProgress > 0 ? "Uploading..." : "Creating...") : "Create Post"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

