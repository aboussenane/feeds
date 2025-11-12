import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { authenticateRequest } from "@/lib/api-auth";

const BUCKET_NAME = "feed-uploads";
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB maximum for all files

export async function POST(request: NextRequest) {
  try {
    // Require authentication for uploads
    const auth = await authenticateRequest(request);
    if (!auth) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");

    if (!isImage && !isVideo) {
      return NextResponse.json(
        { error: "File must be an image or video" },
        { status: 400 }
      );
    }

    // Validate file size - all files must be 50MB or less
    const maxSizeMB = MAX_FILE_SIZE / 1024 / 1024;
    const fileSizeMB = (file.size / 1024 / 1024).toFixed(2);
    
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size (${fileSizeMB}MB) exceeds the maximum allowed size of ${maxSizeMB}MB. Please choose a smaller file.` },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const storage = supabase.storage.from(BUCKET_NAME);

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split(".").pop() || (isImage ? "jpg" : "mp4");
    const filename = `${auth.userId}/${timestamp}-${randomString}.${extension}`;

    // Upload to Supabase Storage (all files now go to Supabase)
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage
    const { error } = await storage.upload(filename, buffer, {
      contentType: file.type,
      upsert: false,
    });

    if (error) {
      console.error("Supabase storage error:", error);
      return NextResponse.json(
        { error: error.message || "Failed to upload file" },
        { status: 500 }
      );
    }

    // Get public URL
    const urlResult = storage.getPublicUrl(filename);
    const publicUrl = urlResult.data?.publicUrl;
    
    if (!publicUrl) {
      return NextResponse.json(
        { error: "Failed to get file URL" },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: publicUrl });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}

