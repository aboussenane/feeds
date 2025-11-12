import { notFound } from "next/navigation"
import { Metadata } from "next"
import { prisma } from "@/lib/prisma"
import { FeedPageContent } from "@/components/feed-page-content"
import { StructuredData } from "@/components/structured-data"
import { getCurrentUser, getUserByUsername } from "@/lib/auth"
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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string; feedTitle: string }>
}): Promise<Metadata> {
  const { username, feedTitle } = await params
  const normalizedUsername = username.toLowerCase()
  const user = await getUserByUsername(normalizedUsername)
  
  if (!user) {
    return {
      title: "Feed Not Found",
    }
  }

  const feed = await prisma.feed.findFirst({
    where: {
      userId: user.id,
      slug: feedTitle,
    },
    include: {
      posts: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  })

  if (!feed) {
    return {
      title: "Feed Not Found",
    }
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  const feedUrl = `${siteUrl}/feeds/${normalizedUsername}/${feedTitle}`
  const postCount = feed.posts.length
  const latestPost = feed.posts[0]
  
  // Get first image from latest post if available
  const imageUrl = latestPost?.imageUrl || latestPost?.videoUrl || null

  const title = `${feed.title}${feed.description ? ` - ${feed.description}` : ""}`
  const description = feed.description || `View ${postCount} post${postCount !== 1 ? "s" : ""} in ${feed.title} by ${normalizedUsername}`

  return {
    title: feed.title,
    description,
    openGraph: {
      title: feed.title,
      description,
      url: feedUrl,
      siteName: "Feeds",
      images: imageUrl
        ? [
            {
              url: imageUrl,
              width: 1200,
              height: 630,
              alt: feed.title,
            },
          ]
        : [
            {
              url: `${siteUrl}/og-image.png`,
              width: 1200,
              height: 630,
              alt: feed.title,
            },
          ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: feed.title,
      description,
      images: imageUrl ? [imageUrl] : [`${siteUrl}/og-image.png`],
    },
    alternates: {
      canonical: feedUrl,
    },
  }
}

export default async function FeedPage({
  params,
}: {
  params: Promise<{ username: string; feedTitle: string }>
}) {
  const { username, feedTitle } = await params
  const currentUser = await getCurrentUser()
  
  // Normalize username to lowercase for lookup (URLs should be lowercase)
  const normalizedUsername = username.toLowerCase()
  
  // Get user by username (case-insensitive lookup)
  const user = await getUserByUsername(normalizedUsername)
  
  if (!user) {
    notFound()
  }

  // Find the feed
  let feed = null;
  try {
    feed = await prisma.feed.findUnique({
      where: {
        userId_slug: {
          userId: user.id,
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
        userId: user.id,
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

  const isOwner = currentUser?.id === feed.userId

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
    <>
      <StructuredData 
        feed={feed as FeedWithPosts}
        username={normalizedUsername}
        feedTitle={feedTitle}
      />
      <FeedPageContent 
        feed={feed as FeedWithPosts}
        feedStyles={feedStyles}
        username={normalizedUsername}
        feedTitle={feedTitle}
        isOwner={isOwner}
      />
    </>
  )
}

