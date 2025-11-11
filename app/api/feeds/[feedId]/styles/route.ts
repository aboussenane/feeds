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
    const { 
      fontFamily, 
      fontColor, 
      secondaryTextColor,
      cardBgColor, 
      cardBorderColor, 
      feedBgColor,
      buttonColor,
      buttonSecondaryColor
    } = body;

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
    const colorFields = [
      { field: fontColor, name: "font color" },
      { field: secondaryTextColor, name: "secondary text color" },
      { field: cardBgColor, name: "card background color" },
      { field: cardBorderColor, name: "card border color" },
      { field: feedBgColor, name: "feed background color" },
      { field: buttonColor, name: "button color" },
      { field: buttonSecondaryColor, name: "secondary button color" },
    ];

    for (const { field, name } of colorFields) {
      if (field && !hexColorRegex.test(field)) {
        return NextResponse.json(
          { error: `Invalid ${name} format. Use hex format (e.g., #000000)` },
          { status: 400 }
        );
      }
    }

    // Update feed styles
    const updatedFeed = await prisma.feed.update({
      where: { id: feedId },
      data: {
        fontFamily: fontFamily || null,
        fontColor: fontColor || null,
        secondaryTextColor: secondaryTextColor || null,
        cardBgColor: cardBgColor || null,
        cardBorderColor: cardBorderColor || null,
        feedBgColor: feedBgColor || null,
        buttonColor: buttonColor || null,
        buttonSecondaryColor: buttonSecondaryColor || null,
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

