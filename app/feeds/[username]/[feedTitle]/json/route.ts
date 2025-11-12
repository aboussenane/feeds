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
    
    // Generate JSON Feed (JSON Feed 1.1 spec)
    const jsonFeed = {
      version: "https://jsonfeed.org/version/1.1",
      title: feed.title,
      description: feed.description || feed.title,
      home_page_url: feedUrl,
      feed_url: `${feedUrl}/json`,
      language: "en",
      author: {
        name: normalizedUsername,
      },
      items: feed.posts.map((post) => ({
        id: post.id,
        url: `${feedUrl}#post-${post.id}`,
        title: post.content?.substring(0, 100) || "Post",
        content_text: post.content || "",
        content_html: post.content ? `<p>${post.content.replace(/\n/g, "<br>")}</p>` : undefined,
        date_published: new Date(post.createdAt).toISOString(),
        date_modified: new Date(post.updatedAt).toISOString(),
        ...(post.imageUrl && { image: post.imageUrl }),
        ...(post.videoUrl && { video: post.videoUrl }),
        ...(post.url && { external_url: post.url }),
        attachments: [
          ...(post.imageUrl ? [{
            url: post.imageUrl,
            mime_type: "image/jpeg",
            title: "Post image",
          }] : []),
          ...(post.videoUrl ? [{
            url: post.videoUrl,
            mime_type: "video/mp4",
            title: "Post video",
          }] : []),
        ],
      })),
    }

    return NextResponse.json(jsonFeed, {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    })
  } catch (error) {
    console.error("Error generating JSON feed:", error)
    return NextResponse.json({ error: "Failed to generate JSON feed" }, { status: 500 })
  }
}

