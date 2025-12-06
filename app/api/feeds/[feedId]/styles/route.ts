import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest } from "@/lib/api-auth";

export async function PATCH(
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
    const body = await request.json();
    const { fontFamily, fontColor, cardBgColor, cardBorderColor, feedBgColor } = body;

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

    // Validate hex colors if provided
    const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (fontColor && !hexColorRegex.test(fontColor)) {
      return NextResponse.json(
        { error: "Invalid font color format. Use hex format (e.g., #000000)" },
        { status: 400 }
      );
    }
    if (cardBgColor && !hexColorRegex.test(cardBgColor)) {
      return NextResponse.json(
        { error: "Invalid card background color format. Use hex format (e.g., #ffffff)" },
        { status: 400 }
      );
    }
    if (cardBorderColor && !hexColorRegex.test(cardBorderColor)) {
      return NextResponse.json(
        { error: "Invalid card border color format. Use hex format (e.g., #e5e5e5)" },
        { status: 400 }
      );
    }
    if (feedBgColor && !hexColorRegex.test(feedBgColor)) {
      return NextResponse.json(
        { error: "Invalid feed background color format. Use hex format (e.g., #ffffff)" },
        { status: 400 }
      );
    }

    // Update feed styles
    const updatedFeed = await prisma.feed.update({
      where: { id: feedId },
      data: {
        fontFamily: fontFamily || null,
        fontColor: fontColor || null,
        cardBgColor: cardBgColor || null,
        cardBorderColor: cardBorderColor || null,
        feedBgColor: feedBgColor || null,
      },
    });

    return NextResponse.json(updatedFeed);
  } catch (error) {
    console.error("Error updating feed styles:", error);
    return NextResponse.json(
      { error: "Failed to update feed styles" },
      { status: 500 }
    );
  }
}

