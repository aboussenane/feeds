/**
 * Utility functions for URL embedding and detection
 */

export type UrlEmbedType = "youtube" | "image" | "video" | "link" | "unknown";

export interface UrlEmbedInfo {
  type: UrlEmbedType;
  embedUrl?: string;
  thumbnailUrl?: string;
  title?: string;
}

/**
 * Detects the type of URL and returns embed information
 */
export function detectUrlType(url: string): UrlEmbedInfo {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();

    // YouTube detection
    if (hostname.includes("youtube.com") || hostname.includes("youtu.be")) {
      let videoId: string | null = null;

      if (hostname.includes("youtu.be")) {
        videoId = urlObj.pathname.slice(1);
      } else if (urlObj.pathname === "/watch") {
        videoId = urlObj.searchParams.get("v");
      } else if (urlObj.pathname.startsWith("/embed/")) {
        videoId = urlObj.pathname.split("/embed/")[1];
      }

      if (videoId) {
        return {
          type: "youtube",
          embedUrl: `https://www.youtube.com/embed/${videoId}`,
          thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        };
      }
    }

    // Vimeo detection
    if (hostname.includes("vimeo.com")) {
      const videoId = urlObj.pathname.split("/").filter(Boolean).pop();
      if (videoId) {
        return {
          type: "video",
          embedUrl: `https://player.vimeo.com/video/${videoId}`,
        };
      }
    }

    // Image detection (common image extensions)
    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".bmp"];
    const pathname = urlObj.pathname.toLowerCase();
    if (imageExtensions.some(ext => pathname.endsWith(ext))) {
      return {
        type: "image",
        embedUrl: url,
      };
    }

    // Video detection (common video extensions)
    const videoExtensions = [".mp4", ".webm", ".ogg", ".mov", ".avi"];
    if (videoExtensions.some(ext => pathname.endsWith(ext))) {
      return {
        type: "video",
        embedUrl: url,
      };
    }

    // Generic link
    return {
      type: "link",
      embedUrl: url,
    };
  } catch {
    return {
      type: "unknown",
    };
  }
}

/**
 * Validates if a string is a valid URL
 */
export function isValidUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

