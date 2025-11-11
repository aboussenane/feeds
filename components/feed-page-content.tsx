"use client"

import { useEffect } from "react"
import { FeedView } from "@/components/feed-view"
import { StyledFeedWrapper } from "@/components/styled-feed-wrapper"
import { useFeedStyles } from "@/context/feed-styles-context"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { ShareButton } from "@/components/share-button"
import { Post } from "@prisma/client"
import { Feed } from "@prisma/client"

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

export function FeedPageContent({
  feed,
  feedStyles,
  userId,
  feedTitle,
  isOwner,
}: {
  feed: FeedWithPosts
  feedStyles: FeedStyles
  userId: string
  feedTitle: string
  isOwner: boolean
}) {
  const { setStyles } = useFeedStyles()

  useEffect(() => {
    setStyles(feedStyles)
    return () => setStyles(null)
  }, [feedStyles, setStyles])

  return (
    <StyledFeedWrapper styles={feedStyles}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 hover:opacity-80 mb-4 transition-opacity"
              style={{ color: feedStyles.secondaryTextColor || undefined }}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to home
            </Link>
            
            <div className="flex items-start justify-between gap-4 mb-4">
              <div style={{ fontFamily: feedStyles.fontFamily || undefined }}>
                <h1 
                  className="text-3xl font-bold mb-2"
                  style={{ color: feedStyles.fontColor || undefined }}
                >
                  {feed.title}
                </h1>
                {feed.description && (
                  <p style={{ color: feedStyles.secondaryTextColor || undefined }}>
                    {feed.description}
                  </p>
                )}
                <p 
                  className="text-sm mt-2"
                  style={{ color: feedStyles.secondaryTextColor || undefined }}
                >
                  /feeds/{userId}/{feedTitle}
                </p>
              </div>
              <ShareButton 
                userId={userId} 
                feedTitle={feedTitle}
                buttonSecondaryColor={feedStyles.buttonSecondaryColor}
                fontColor={feedStyles.fontColor}
              />
            </div>
          </div>

          <FeedView feed={feed} isOwner={isOwner} />
        </div>
      </div>
    </StyledFeedWrapper>
  )
}

