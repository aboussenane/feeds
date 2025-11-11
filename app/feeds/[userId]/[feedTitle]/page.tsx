import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { FeedPageContent } from "@/components/feed-page-content"
import { getCurrentUser } from "@/lib/auth"
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

export default async function FeedPage({
  params,
}: {
  params: Promise<{ userId: string; feedTitle: string }>
}) {
  const { userId, feedTitle } = await params
  const user = await getCurrentUser()
  
  // Try using composite unique constraint first, fallback to findFirst if not available
  let feed = null;
  try {
    feed = await prisma.feed.findUnique({
      where: {
        userId_slug: {
          userId,
          slug: feedTitle,
        },
      },
      include: {
        posts: {
          orderBy: { createdAt: "desc" },
        },
      },
    });
  } catch {
    // Fallback if composite unique constraint doesn't exist yet
    feed = await prisma.feed.findFirst({
      where: {
        userId,
        slug: feedTitle,
      },
      include: {
        posts: {
          orderBy: { createdAt: "desc" },
        },
      },
    });
  }

  if (!feed) {
    notFound()
  }

  const isOwner = user?.id === feed.userId

  // Type assertion needed until Prisma client is regenerated
  const feedWithStyles = feed as typeof feed & {
    fontFamily?: string | null
    fontColor?: string | null
    secondaryTextColor?: string | null
    cardBgColor?: string | null
    cardBorderColor?: string | null
    feedBgColor?: string | null
    buttonColor?: string | null
    buttonSecondaryColor?: string | null
  }

  const feedStyles = {
    fontFamily: feedWithStyles.fontFamily,
    fontColor: feedWithStyles.fontColor,
    secondaryTextColor: feedWithStyles.secondaryTextColor,
    cardBgColor: feedWithStyles.cardBgColor,
    cardBorderColor: feedWithStyles.cardBorderColor,
    feedBgColor: feedWithStyles.feedBgColor,
    buttonColor: feedWithStyles.buttonColor,
    buttonSecondaryColor: feedWithStyles.buttonSecondaryColor,
  }

  return (
    <FeedPageContent 
      feed={feed as FeedWithPosts}
      feedStyles={feedStyles}
      userId={userId}
      feedTitle={feedTitle}
      isOwner={isOwner}
    />
  )
}

