import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, updateUsername, getOrCreateUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username");

    if (!username) {
      return NextResponse.json(
        { error: "Username parameter is required" },
        { status: 400 }
      );
    }

    // Validate format
    if (!/^[a-zA-Z0-9_-]{3,20}$/.test(username)) {
      return NextResponse.json(
        { available: false, reason: "invalid_format" },
        { status: 200 }
      );
    }

    // Normalize to lowercase for comparison (usernames are stored in lowercase)
    const normalizedUsername = username.toLowerCase();

    // Check if username is taken (direct lookup since stored in lowercase)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existingUser = await (prisma as any).user.findUnique({
      where: { username: normalizedUsername },
    });

    // Get current user to check if it's their own username
    const currentUser = await getCurrentUser();
    if (currentUser) {
      const dbUser = await getOrCreateUser(currentUser.id);
      // If it's the user's current username (case-insensitive), it's available to them
      if (dbUser.username && dbUser.username.toLowerCase() === normalizedUsername) {
        return NextResponse.json(
          { available: true },
          { status: 200 }
        );
      }
    }

    return NextResponse.json(
      { available: !existingUser },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error checking username:", error);
    return NextResponse.json(
      { error: "Failed to check username" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { username } = body;

    if (!username || typeof username !== "string") {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      );
    }

    // Update username with validation
    const updatedUser = await updateUsername(user.id, username);

    return NextResponse.json(
      { username: updatedUser.username },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating username:", error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update username" },
      { status: 500 }
    );
  }
}

