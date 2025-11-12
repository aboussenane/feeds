import { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "What is Feeds?",
  description: "Feeds is a developer-friendly feed hosting platform for creating and sharing content feeds. Learn how to create feeds, post content, and integrate via API.",
  openGraph: {
    title: "What is Feeds? - Developer-Friendly Feed Hosting",
    description: "Learn about Feeds - a platform for creating and sharing content feeds",
    type: "article",
  },
}

export default function WhatIsFeedsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <article>
            <h1 className="text-4xl font-bold mb-6">What is Feeds?</h1>
            
            <div className="prose prose-lg max-w-none mb-8">
              <p className="text-xl text-muted-foreground mb-6">
                <strong>Feeds</strong> is a developer-friendly feed hosting platform that allows you to create, manage, and share content feeds with text, images, videos, and URLs.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">Key Features</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Create Multiple Feeds:</strong> Organize your content into separate feeds for different topics or audiences</li>
                <li><strong>Multiple Post Types:</strong> Share text posts, images, videos, and embedded URLs (like YouTube videos)</li>
                <li><strong>Customizable Styling:</strong> Customize fonts, colors, and layouts to match your brand</li>
                <li><strong>RESTful API:</strong> Programmatically create feeds and posts using our developer-friendly API</li>
                <li><strong>RSS & JSON Feeds:</strong> Each feed automatically generates RSS and JSON Feed formats for syndication</li>
                <li><strong>Public Sharing:</strong> Share your feeds with unique URLs that anyone can access</li>
              </ul>

              <h2 className="text-2xl font-semibold mt-8 mb-4">Who is Feeds For?</h2>
              <p>
                Feeds is designed for developers, content creators, and technical teams who need a simple way to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Create and host content feeds</li>
                <li>Share updates, news, or announcements</li>
                <li>Build custom content applications</li>
                <li>Integrate feed functionality into existing applications</li>
                <li>Syndicate content via RSS or JSON feeds</li>
              </ul>

              <h2 className="text-2xl font-semibold mt-8 mb-4">How Does It Work?</h2>
              <ol className="list-decimal pl-6 space-y-3">
                <li><strong>Sign Up:</strong> Create a free account to get started</li>
                <li><strong>Create a Feed:</strong> Give your feed a title and optional description</li>
                <li><strong>Add Posts:</strong> Post text, images, videos, or URLs to your feed</li>
                <li><strong>Share:</strong> Share your feed URL with others or integrate via API</li>
                <li><strong>Customize:</strong> Style your feed to match your brand</li>
              </ol>

              <h2 className="text-2xl font-semibold mt-8 mb-4">Use Cases</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Developer Blogs:</strong> Share technical updates and tutorials</li>
                <li><strong>Product Updates:</strong> Announce new features and releases</li>
                <li><strong>News Aggregation:</strong> Curate and share news from multiple sources</li>
                <li><strong>Content Syndication:</strong> Distribute content via RSS feeds</li>
                <li><strong>API Integration:</strong> Build custom applications that create and manage feeds programmatically</li>
              </ul>

              <h2 className="text-2xl font-semibold mt-8 mb-4">Getting Started</h2>
              <p>
                Ready to create your first feed? It's free and takes just a few minutes to get started.
              </p>
              <div className="mt-6">
                <Link href="/login">
                  <Button size="lg">Get Started Free</Button>
                </Link>
              </div>

              <h2 className="text-2xl font-semibold mt-8 mb-4">Learn More</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li><Link href="/how-to-create-feeds" className="text-primary hover:underline">How to Create Feeds</Link></li>
                <li><Link href="/docs" className="text-primary hover:underline">API Documentation</Link></li>
                <li><Link href="/" className="text-primary hover:underline">Browse Example Feeds</Link></li>
              </ul>
            </div>
          </article>
        </div>
      </div>
    </div>
  )
}

