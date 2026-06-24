import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

type SitemapEntry = {
  url: string
  lastModified: Date
  changeFrequency?: string
  priority?: number
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function toSitemapXml(entries: SitemapEntry[]) {
  const body = entries
    .map((entry) => {
      const lines = [
        '  <url>',
        `    <loc>${escapeXml(entry.url)}</loc>`,
        `    <lastmod>${entry.lastModified.toISOString()}</lastmod>`,
      ]

      if (entry.changeFrequency) {
        lines.push(`    <changefreq>${entry.changeFrequency}</changefreq>`)
      }

      if (entry.priority !== undefined) {
        lines.push(`    <priority>${entry.priority.toFixed(1)}</priority>`)
      }

      lines.push('  </url>')
      return lines.join('\n')
    })
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`
}

function getStaticPages(baseUrl: string): SitemapEntry[] {
  const now = new Date()

  return [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/what-is-feeds`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/how-to-create-feeds`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/docs`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ]
}

async function getFeedPages(baseUrl: string): Promise<SitemapEntry[]> {
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
    take: 1000,
  })

  return feeds.map((feed) => {
    const username = feed.user?.username || feed.userId
    const normalizedUsername = username ? username.toLowerCase() : username

    return {
      url: `${baseUrl}/feeds/${normalizedUsername}/${feed.slug}`,
      lastModified: feed.updatedAt,
      changeFrequency: 'daily',
      priority: 0.8,
    }
  })
}

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://feeds-pink.vercel.app'
  const entries = getStaticPages(baseUrl)

  try {
    const feedEntries = await getFeedPages(baseUrl)
    entries.push(...feedEntries)
  } catch (error) {
    console.error('Sitemap: database unavailable, serving static pages only', error)
  }

  return new Response(toSitemapXml(entries), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
