import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { authenticateRequest } from "@/lib/api-auth";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

const BUCKET_NAME = "feed-uploads";
const MAX_IMAGE_SIZE = 50 * 1024 * 1024; // 50MB for images
const MAX_VIDEO_SIZE = 500 * 1024 * 1024; // 500MB for videos
const LARGE_FILE_THRESHOLD = 50 * 1024 * 1024; // 50MB - files larger than this stored locally

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

    // Validate file size based on type
    const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE;
    const maxSizeMB = maxSize / 1024 / 1024;
    
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `${isImage ? 'Image' : 'Video'} size must be less than ${maxSizeMB}MB` },
        { status: 400 }
      );
    }

    // For large files (>50MB), store locally instead of Supabase
    const useLocalStorage = file.size > LARGE_FILE_THRESHOLD;

    const supabase = await createClient();
    const storage = supabase.storage.from(BUCKET_NAME);

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split(".").pop() || (isImage ? "jpg" : "mp4");
    const filename = `${auth.userId}/${timestamp}-${randomString}.${extension}`;

    if (useLocalStorage) {
      // For large files (>50MB), store locally
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Create uploads directory if it doesn't exist
      const uploadsDir = join(process.cwd(), "public", "uploads");
      if (!existsSync(uploadsDir)) {
        await mkdir(uploadsDir, { recursive: true });
      }

      // Create user-specific directory
      const userDir = join(uploadsDir, auth.userId);
      if (!existsSync(userDir)) {
        await mkdir(userDir, { recursive: true });
      }

      // Save file locally
      const localFilename = `${timestamp}-${randomString}.${extension}`;
      const filepath = join(userDir, localFilename);
      await writeFile(filepath, buffer);

      // Return the public URL (relative to public folder)
      const url = `/uploads/${auth.userId}/${localFilename}`;
      return NextResponse.json({ url });
    } else {
      // For smaller files, upload directly from server
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
    }
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}

