import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest } from "@/lib/api-auth";

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { feedId, content, imageUrl, videoUrl, url, type } = body;

    if (!feedId || !type) {
      return NextResponse.json(
        { error: "Feed ID and type are required" },
        { status: 400 }
      );
    }

    // Validate type
    if (!["text", "image", "video", "url"].includes(type)) {
      return NextResponse.json(
        { error: "Type must be 'text', 'image', 'video', or 'url'" },
        { status: 400 }
      );
    }

    // Validate content based on type
    if (type === "text" && !content) {
      return NextResponse.json(
        { error: "Content is required for text posts" },
        { status: 400 }
      );
    }

    if (type === "image" && !imageUrl) {
      return NextResponse.json(
        { error: "Image URL is required for image posts" },
        { status: 400 }
      );
    }

    if (type === "video" && !videoUrl) {
      return NextResponse.json(
        { error: "Video URL is required for video posts" },
        { status: 400 }
      );
    }

    if (type === "url" && !url) {
      return NextResponse.json(
        { error: "URL is required for URL posts" },
        { status: 400 }
      );
    }

    // Validate URL format for URL posts
    if (type === "url" && url) {
      try {
        const urlObj = new URL(url);
        if (urlObj.protocol !== "http:" && urlObj.protocol !== "https:") {
          return NextResponse.json(
            { error: "URL must start with http:// or https://" },
            { status: 400 }
          );
        }
      } catch {
        return NextResponse.json(
          { error: "Invalid URL format" },
          { status: 400 }
        );
      }
    }

    // Verify feed exists and belongs to user
    const feed = await prisma.feed.findUnique({ where: { id: feedId } });
    if (!feed) {
      return NextResponse.json(
        { error: "Feed not found" },
        { status: 404 }
      );
    }

    if (feed.userId !== auth.userId) {
      return NextResponse.json(
        { error: "Forbidden: You don't own this feed" },
        { status: 403 }
      );
    }

    const post = await prisma.post.create({
      data: {
        feedId,
        content: content || null,
        imageUrl: imageUrl || null,
        videoUrl: videoUrl || null,
        url: url || null,
        type,
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
}

