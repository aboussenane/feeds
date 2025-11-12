import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateSlug } from "@/lib/utils";
import { authenticateRequest } from "@/lib/api-auth";

export async function GET(request: NextRequest) {
  try {
    // Require authentication to get user's feeds
    const auth = await authenticateRequest(request);
    if (!auth) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const feeds = await prisma.feed.findMany({
      where: {
        userId: auth.userId,
      },
      orderBy: { createdAt: "desc" },
      include: {
        posts: {
          orderBy: { createdAt: "desc" },
        },
      },
    });
    return NextResponse.json(feeds);
  } catch (error) {
    console.error("Error fetching feeds:", error);
    return NextResponse.json(
      { error: "Failed to fetch feeds" },
      { status: 500 }
    );
  }
}

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
    const { title, description } = body;

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    let slug = generateSlug(title);
    
    // Ensure slug is unique per user
    // Try using composite unique constraint first, fallback to findFirst if not available
    let existingFeed = null;
    try {
      existingFeed = await prisma.feed.findUnique({ 
        where: { 
          userId_slug: {
            userId: auth.userId,
            slug,
          }
        } 
      });
    } catch {
      // Fallback if composite unique constraint doesn't exist yet
      existingFeed = await prisma.feed.findFirst({
        where: {
          userId: auth.userId,
          slug,
        },
      });
    }
    
    let counter = 1;
    while (existingFeed) {
      slug = `${generateSlug(title)}-${counter}`;
      try {
        existingFeed = await prisma.feed.findUnique({ 
          where: { 
            userId_slug: {
              userId: auth.userId,
              slug,
            }
          } 
        });
      } catch {
        // Fallback if composite unique constraint doesn't exist yet
        existingFeed = await prisma.feed.findFirst({
          where: {
            userId: auth.userId,
            slug,
          },
        });
      }
      counter++;
    }

    const feed = await prisma.feed.create({
      data: {
        title,
        description: description || null,
        slug,
        userId: auth.userId,
      },
      include: {
        user: {
          select: {
            username: true,
          },
        },
      },
    });

    // Include username in response for redirect
    return NextResponse.json({
      ...feed,
      username: (feed as any).user?.username || null,
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating feed:", error);
    return NextResponse.json(
      { error: "Failed to create feed" },
      { status: 500 }
    );
  }
}

