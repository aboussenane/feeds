import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://feeds-pink.vercel.app'
  
  // Get all public feeds
  const feeds = await prisma.feed.findMany({
    include: {
      user: {
        select: {
          username: true,
        },
      },
    },
    orderBy: {
      updatedAt: 'desc',
    },
    take: 1000, // Limit to most recent 1000 feeds
  })

  // Generate sitemap entries for feeds
  type FeedWithUser = { user?: { username: string | null } | null }
  const feedEntries: MetadataRoute.Sitemap = feeds.map((feed) => {
    const feedWithUser = feed as FeedWithUser & typeof feed
    const username = feedWithUser.user?.username || feed.userId
    const normalizedUsername = username ? username.toLowerCase() : username
    return {
      url: `${baseUrl}/feeds/${normalizedUsername}/${feed.slug}`,
      lastModified: feed.updatedAt,
      changeFrequency: 'daily',
      priority: 0.8,
    }
  })

  // Add static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/what-is-feeds`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/how-to-create-feeds`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/docs`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ]

  return [...staticPages, ...feedEntries]
}

