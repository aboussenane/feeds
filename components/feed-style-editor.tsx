"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Palette } from "lucide-react"

type FeedStyle = {
  fontFamily?: string | null
  fontColor?: string | null
  secondaryTextColor?: string | null
  cardBgColor?: string | null
  cardBorderColor?: string | null
  feedBgColor?: string | null
  buttonColor?: string | null
  buttonSecondaryColor?: string | null
}

type FeedStyleEditorProps = {
  feedId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  currentStyles: FeedStyle
  onStylesUpdated: (styles: FeedStyle) => void
}

const FONT_OPTIONS = [
  { value: "", label: "Default (System)" },
  { value: "Inter", label: "Inter" },
  { value: "Roboto", label: "Roboto" },
  { value: "Open Sans", label: "Open Sans" },
  { value: "Lato", label: "Lato" },
  { value: "Montserrat", label: "Montserrat" },
  { value: "Poppins", label: "Poppins" },
  { value: "Georgia", label: "Georgia" },
  { value: "Times New Roman", label: "Times New Roman" },
  { value: "Courier New", label: "Courier New" },
]

export function FeedStyleEditor({
  feedId,
  open,
  onOpenChange,
  currentStyles,
  onStylesUpdated,
}: FeedStyleEditorProps) {
  const [styles, setStyles] = useState<FeedStyle>(currentStyles)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    setStyles(currentStyles)
  }, [currentStyles, open])

  const handleStyleChange = (field: keyof FeedStyle, value: string) => {
    setStyles((prev) => ({
      ...prev,
      [field]: value || null,
    }))
  }

  const handleSave = async () => {
    setLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/feeds/styles/${feedId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(styles),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to update styles")
      }

      const updatedFeed = await response.json()
      onStylesUpdated({
        fontFamily: updatedFeed.fontFamily,
        fontColor: updatedFeed.fontColor,
        secondaryTextColor: updatedFeed.secondaryTextColor,
        cardBgColor: updatedFeed.cardBgColor,
        cardBorderColor: updatedFeed.cardBorderColor,
        feedBgColor: updatedFeed.feedBgColor,
        buttonColor: updatedFeed.buttonColor,
        buttonSecondaryColor: updatedFeed.buttonSecondaryColor,
      })
      onOpenChange(false)
      // Reload the page to apply all styles server-side
      window.location.reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setStyles({
      fontFamily: null,
      fontColor: null,
      secondaryTextColor: null,
      cardBgColor: null,
      cardBorderColor: null,
      feedBgColor: null,
      buttonColor: null,
      buttonSecondaryColor: null,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Customize Feed Styles
          </DialogTitle>
          <DialogDescription>
            Customize the appearance of your feed. Changes apply immediately.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Font Family */}
          <div className="space-y-2">
            <Label htmlFor="fontFamily">Font Family</Label>
            <select
              id="fontFamily"
              value={styles.fontFamily || ""}
              onChange={(e) => handleStyleChange("fontFamily", e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {FONT_OPTIONS.map((font) => (
                <option key={font.value} value={font.value}>
                  {font.label}
                </option>
              ))}
            </select>
          </div>

          {/* Font Color */}
          <div className="space-y-2">
            <Label htmlFor="fontColor">Font Color</Label>
            <div className="flex gap-2">
              <Input
                id="fontColor"
                type="color"
                value={styles.fontColor || "#000000"}
                onChange={(e) => handleStyleChange("fontColor", e.target.value)}
                className="h-10 w-20 cursor-pointer"
              />
              <Input
                type="text"
                placeholder="#000000"
                value={styles.fontColor || ""}
                onChange={(e) => handleStyleChange("fontColor", e.target.value)}
                className="flex-1 font-mono"
              />
            </div>
          </div>

          {/* Card Background Color */}
          <div className="space-y-2">
            <Label htmlFor="cardBgColor">Card Background Color</Label>
            <div className="flex gap-2">
              <Input
                id="cardBgColor"
                type="color"
                value={styles.cardBgColor || "#ffffff"}
                onChange={(e) => handleStyleChange("cardBgColor", e.target.value)}
                className="h-10 w-20 cursor-pointer"
              />
              <Input
                type="text"
                placeholder="#ffffff"
                value={styles.cardBgColor || ""}
                onChange={(e) => handleStyleChange("cardBgColor", e.target.value)}
                className="flex-1 font-mono"
              />
            </div>
          </div>

          {/* Card Border Color */}
          <div className="space-y-2">
            <Label htmlFor="cardBorderColor">Card Border Color</Label>
            <div className="flex gap-2">
              <Input
                id="cardBorderColor"
                type="color"
                value={styles.cardBorderColor || "#e5e5e5"}
                onChange={(e) => handleStyleChange("cardBorderColor", e.target.value)}
                className="h-10 w-20 cursor-pointer"
              />
              <Input
                type="text"
                placeholder="#e5e5e5"
                value={styles.cardBorderColor || ""}
                onChange={(e) => handleStyleChange("cardBorderColor", e.target.value)}
                className="flex-1 font-mono"
              />
            </div>
          </div>

          {/* Secondary Text Color */}
          <div className="space-y-2">
            <Label htmlFor="secondaryTextColor">Secondary Text Color</Label>
            <div className="flex gap-2">
              <Input
                id="secondaryTextColor"
                type="color"
                value={styles.secondaryTextColor || "#6b7280"}
                onChange={(e) => handleStyleChange("secondaryTextColor", e.target.value)}
                className="h-10 w-20 cursor-pointer"
              />
              <Input
                type="text"
                placeholder="#6b7280"
                value={styles.secondaryTextColor || ""}
                onChange={(e) => handleStyleChange("secondaryTextColor", e.target.value)}
                className="flex-1 font-mono"
              />
            </div>
          </div>

          {/* Feed Background Color */}
          <div className="space-y-2">
            <Label htmlFor="feedBgColor">Feed Background Color</Label>
            <div className="flex gap-2">
              <Input
                id="feedBgColor"
                type="color"
                value={styles.feedBgColor || "#ffffff"}
                onChange={(e) => handleStyleChange("feedBgColor", e.target.value)}
                className="h-10 w-20 cursor-pointer"
              />
              <Input
                type="text"
                placeholder="#ffffff"
                value={styles.feedBgColor || ""}
                onChange={(e) => handleStyleChange("feedBgColor", e.target.value)}
                className="flex-1 font-mono"
              />
            </div>
          </div>

          {/* Button Color */}
          <div className="space-y-2">
            <Label htmlFor="buttonColor">Primary Button Color</Label>
            <div className="flex gap-2">
              <Input
                id="buttonColor"
                type="color"
                value={styles.buttonColor || "#000000"}
                onChange={(e) => handleStyleChange("buttonColor", e.target.value)}
                className="h-10 w-20 cursor-pointer"
              />
              <Input
                type="text"
                placeholder="#000000"
                value={styles.buttonColor || ""}
                onChange={(e) => handleStyleChange("buttonColor", e.target.value)}
                className="flex-1 font-mono"
              />
            </div>
          </div>

          {/* Secondary Button Color */}
          <div className="space-y-2">
            <Label htmlFor="buttonSecondaryColor">Secondary Button Color</Label>
            <div className="flex gap-2">
              <Input
                id="buttonSecondaryColor"
                type="color"
                value={styles.buttonSecondaryColor || "#e5e5e5"}
                onChange={(e) => handleStyleChange("buttonSecondaryColor", e.target.value)}
                className="h-10 w-20 cursor-pointer"
              />
              <Input
                type="text"
                placeholder="#e5e5e5"
                value={styles.buttonSecondaryColor || ""}
                onChange={(e) => handleStyleChange("buttonSecondaryColor", e.target.value)}
                className="flex-1 font-mono"
              />
            </div>
          </div>

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={loading}
            >
              Reset to Default
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSave} disabled={loading}>
              {loading ? "Saving..." : "Save Styles"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

