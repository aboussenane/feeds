import { NextResponse } from "next/server"

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://feeds-pink.vercel.app"
  
  return NextResponse.json({
    name: "Feeds",
    description: "Developer-friendly feed hosting platform for creating and sharing content feeds",
    version: "1.0.0",
    api: {
      baseUrl: `${siteUrl}/api`,
      documentation: `${siteUrl}/docs`,
      authentication: "Bearer token (API key)",
    },
    features: [
      "Create and manage multiple feeds",
      "Post text, images, videos, and URLs",
      "RESTful API for programmatic access",
      "Customizable feed styling",
      "RSS and JSON Feed support",
      "Public feed sharing",
    ],
    feedFormats: {
      rss: "/feeds/[username]/[feedTitle]/rss",
      json: "/feeds/[username]/[feedTitle]/json",
    },
    links: {
      homepage: siteUrl,
      documentation: `${siteUrl}/docs`,
      whatIs: `${siteUrl}/what-is-feeds`,
      howTo: `${siteUrl}/how-to-create-feeds`,
    },
  }, {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  })
}

