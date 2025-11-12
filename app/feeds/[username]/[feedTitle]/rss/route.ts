import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserByUsername } from "@/lib/auth"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string; feedTitle: string }> }
) {
  try {
    const { username, feedTitle } = await params
    const normalizedUsername = username.toLowerCase()
    
    const user = await getUserByUsername(normalizedUsername)
    if (!user) {
      return NextResponse.json({ error: "Feed not found" }, { status: 404 })
    }

    const feed = await prisma.feed.findFirst({
      where: {
        userId: user.id,
        slug: feedTitle,
      },
      include: {
        posts: {
          orderBy: { createdAt: "desc" },
          take: 50, // Limit to most recent 50 posts
        },
      },
    })

    if (!feed) {
      return NextResponse.json({ error: "Feed not found" }, { status: 404 })
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
    const feedUrl = `${siteUrl}/feeds/${normalizedUsername}/${feedTitle}`
    
    // Generate RSS XML
    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(feed.title)}</title>
    <link>${feedUrl}</link>
    <description>${escapeXml(feed.description || feed.title)}</description>
    <language>en-us</language>
    <lastBuildDate>${new Date(feed.updatedAt).toUTCString()}</lastBuildDate>
    <atom:link href="${feedUrl}/rss" rel="self" type="application/rss+xml"/>
    ${feed.posts.map((post) => `
    <item>
      <title>${escapeXml(post.content?.substring(0, 100) || "Post")}</title>
      <link>${feedUrl}#post-${post.id}</link>
      <guid isPermaLink="false">${feedUrl}#post-${post.id}</guid>
      <pubDate>${new Date(post.createdAt).toUTCString()}</pubDate>
      <description>${escapeXml(post.content?.substring(0, 500) || "")}</description>
      ${post.imageUrl ? `<enclosure url="${post.imageUrl}" type="image/jpeg"/>` : ""}
      ${post.videoUrl ? `<enclosure url="${post.videoUrl}" type="video/mp4"/>` : ""}
      ${post.url ? `<link>${post.url}</link>` : ""}
    </item>`).join("")}
  </channel>
</rss>`

    return new NextResponse(rss, {
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    })
  } catch (error) {
    console.error("Error generating RSS feed:", error)
    return NextResponse.json({ error: "Failed to generate RSS feed" }, { status: 500 })
  }
}

function escapeXml(unsafe: string | null | undefined): string {
  if (!unsafe) return ""
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

