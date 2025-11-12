import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest } from "@/lib/api-auth";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ feedId: string }> }
) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { feedId } = await params;

    // Get the feed and verify ownership
    const feed = await prisma.feed.findUnique({
      where: { id: feedId },
    });

    if (!feed) {
      return NextResponse.json(
        { error: "Feed not found" },
        { status: 404 }
      );
    }

    // Verify user owns the feed
    if (feed.userId !== auth.userId) {
      return NextResponse.json(
        { error: "Forbidden: You don't own this feed" },
        { status: 403 }
      );
    }

    // Delete the feed (posts will be cascade deleted due to onDelete: Cascade)
    await prisma.feed.delete({
      where: { id: feedId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting feed:", error);
    return NextResponse.json(
      { error: "Failed to delete feed" },
      { status: 500 }
    );
  }
}

