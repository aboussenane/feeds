import { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"

export const metadata: Metadata = {
  title: "How to Create Feeds",
  description: "Step-by-step guide on how to create and manage feeds on Feeds platform. Learn how to create feeds, add posts, customize styling, and share your content.",
  openGraph: {
    title: "How to Create Feeds - Step-by-Step Guide",
    description: "Learn how to create and manage feeds on Feeds platform",
    type: "article",
  },
}

export default function HowToCreateFeedsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <article>
            <h1 className="text-4xl font-bold mb-6">How to Create Feeds</h1>
            
            <div className="prose prose-lg max-w-none mb-8">
              <p className="text-xl text-muted-foreground mb-8">
                This guide will walk you through creating your first feed, adding posts, and sharing your content.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">Step 1: Sign Up or Log In</h2>
              <p>
                First, you'll need an account. If you don't have one yet, <Link href="/login" className="text-primary hover:underline">sign up for free</Link>.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">Step 2: Create Your First Feed</h2>
              <ol className="list-decimal pl-6 space-y-3">
                <li>Click the <strong>"Create New Feed"</strong> button on the homepage</li>
                <li>Enter a title for your feed (e.g., "My Developer Blog")</li>
                <li>Optionally add a description</li>
                <li>Click <strong>"Create Feed"</strong></li>
              </ol>
              <p className="mt-4">
                Your feed will be created with a unique URL based on your username and the feed title slug.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">Step 3: Add Posts to Your Feed</h2>
              <p>You can add different types of posts to your feed:</p>
              
              <div className="mt-4 space-y-4">
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Text Posts
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Write plain text content. Perfect for updates, announcements, or blog-style posts.
                  </p>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Image Posts
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Upload images (up to 50MB) with optional captions. Supports common image formats.
                  </p>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Video Posts
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Upload videos (up to 50MB) with optional captions. Videos are displayed with native controls.
                  </p>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    URL Posts
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Embed URLs like YouTube videos, images, or any link. The platform automatically detects and embeds the content appropriately.
                  </p>
                </div>
              </div>

              <h2 className="text-2xl font-semibold mt-8 mb-4">Step 4: Customize Your Feed</h2>
              <p>
                Make your feed unique by customizing its appearance:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li><strong>Font Family:</strong> Choose from available fonts</li>
                <li><strong>Colors:</strong> Customize text, background, and button colors</li>
                <li><strong>Card Styling:</strong> Adjust card backgrounds and borders</li>
              </ul>
              <p className="mt-4">
                Click the <strong>"Customize Styles"</strong> button on your feed page to access styling options.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">Step 5: Share Your Feed</h2>
              <p>
                Once your feed is ready, share it with others:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li><strong>Direct URL:</strong> Share the feed URL directly (e.g., <code>/feeds/username/feed-title</code>)</li>
                <li><strong>RSS Feed:</strong> Each feed automatically has an RSS feed at <code>/feeds/username/feed-title/rss</code></li>
                <li><strong>JSON Feed:</strong> JSON Feed format available at <code>/feeds/username/feed-title/json</code></li>
                <li><strong>Share Button:</strong> Use the share button on your feed page for easy sharing</li>
              </ul>

              <h2 className="text-2xl font-semibold mt-8 mb-4">Step 6: Manage Your Feed</h2>
              <p>
                As the feed owner, you can:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li>Edit or delete posts</li>
                <li>Update feed styling</li>
                <li>View feed statistics</li>
                <li>Manage feed via API</li>
              </ul>

              <h2 className="text-2xl font-semibold mt-8 mb-4">Using the API</h2>
              <p>
                For programmatic access, use our RESTful API to create feeds and posts. See our <Link href="/docs" className="text-primary hover:underline">API documentation</Link> for complete details.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">Tips for Success</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Use descriptive feed titles and descriptions</li>
                <li>Post regularly to keep your feed active</li>
                <li>Add captions to images and videos for better context</li>
                <li>Customize your feed styling to match your brand</li>
                <li>Share your feed URL on social media or your website</li>
              </ul>

              <div className="mt-8 p-6 bg-muted rounded-lg">
                <h3 className="text-xl font-semibold mb-2">Ready to Get Started?</h3>
                <p className="mb-4">
                  Create your first feed now and start sharing your content with the world.
                </p>
                <Link href="/login">
                  <Button>Create Your First Feed</Button>
                </Link>
              </div>

              <h2 className="text-2xl font-semibold mt-8 mb-4">Learn More</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li><Link href="/what-is-feeds" className="text-primary hover:underline">What is Feeds?</Link></li>
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

