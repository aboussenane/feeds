import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest } from "@/lib/api-auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { postId } = await params;
    const body = await request.json();
    const { content, imageUrl, videoUrl, url, type } = body;

    // Get the post and verify ownership through feed
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { feed: true },
    });

    if (!post) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    // Verify user owns the feed
    if (post.feed.userId !== auth.userId) {
      return NextResponse.json(
        { error: "Forbidden: You don't own this post" },
        { status: 403 }
      );
    }

    // Validate type if provided
    if (type && !["text", "image", "video", "url"].includes(type)) {
      return NextResponse.json(
        { error: "Type must be 'text', 'image', 'video', or 'url'" },
        { status: 400 }
      );
    }

    // Validate content based on type
    const postType = type || post.type;
    if (postType === "text" && !content) {
      return NextResponse.json(
        { error: "Content is required for text posts" },
        { status: 400 }
      );
    }

    if (postType === "image" && !imageUrl && !post.imageUrl) {
      return NextResponse.json(
        { error: "Image URL is required for image posts" },
        { status: 400 }
      );
    }

    if (postType === "video" && !videoUrl && !post.videoUrl) {
      return NextResponse.json(
        { error: "Video URL is required for video posts" },
        { status: 400 }
      );
    }

    type PostWithUrl = typeof post & { url?: string | null }
    const postWithUrl = post as PostWithUrl
    if (postType === "url" && !url && !postWithUrl.url) {
      return NextResponse.json(
        { error: "URL is required for URL posts" },
        { status: 400 }
      );
    }

    // Validate URL format for URL posts
    if (postType === "url" && url) {
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

    // Update the post
    type PostUpdateData = {
      content: string | null
      imageUrl: string | null
      videoUrl: string | null
      url?: string | null
      type: string
    }
    const updateData: PostUpdateData = {
      content: content !== undefined ? content : post.content,
      imageUrl: imageUrl !== undefined ? imageUrl : post.imageUrl,
      videoUrl: videoUrl !== undefined ? videoUrl : post.videoUrl,
      url: url !== undefined ? url : postWithUrl.url || null,
      type: type || post.type,
    }
    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: updateData,
    });

    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error("Error updating post:", error);
    return NextResponse.json(
      { error: "Failed to update post" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { postId } = await params;

    // Get the post and verify ownership through feed
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { feed: true },
    });

    if (!post) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    // Verify user owns the feed
    if (post.feed.userId !== auth.userId) {
      return NextResponse.json(
        { error: "Forbidden: You don't own this post" },
        { status: 403 }
      );
    }

    // Delete the post
    await prisma.post.delete({
      where: { id: postId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 }
    );
  }
}

