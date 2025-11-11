import { NextResponse } from "next/server";
import { getCurrentUser, regenerateApiKey } from "@/lib/auth";

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Regenerate API key (deletes old one and creates new one)
    const apiKey = await regenerateApiKey(user.id);

    return NextResponse.json(
      { key: apiKey.key },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error regenerating API key:", error);
    return NextResponse.json(
      { error: "Failed to regenerate API key" },
      { status: 500 }
    );
  }
}

