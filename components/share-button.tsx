"use client"

import { Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"

type ShareButtonProps = {
  userId: string
  feedTitle: string
  buttonSecondaryColor?: string | null
  fontColor?: string | null
}

export function ShareButton({ 
  userId, 
  feedTitle,
  buttonSecondaryColor,
  fontColor
}: ShareButtonProps) {
  const handleShare = async () => {
    const url = `${window.location.origin}/feeds/${userId}/${feedTitle}`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Check out this feed",
          url,
        })
      } catch {
        // User cancelled or error occurred
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(url)
      alert("Link copied to clipboard!")
    }
  }

  return (
    <Button 
      onClick={handleShare} 
      variant="outline" 
      size="sm" 
      className="gap-2"
      style={{
        backgroundColor: buttonSecondaryColor || undefined,
        color: fontColor || undefined,
        borderColor: buttonSecondaryColor || undefined,
      }}
    >
      <Share2 className="h-4 w-4" />
      Share
    </Button>
  )
}

