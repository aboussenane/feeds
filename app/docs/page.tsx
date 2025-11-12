import { Metadata } from "next"
import Link from "next/link"
import { Code, Key, Book, Rss } from "lucide-react"

export const metadata: Metadata = {
  title: "API Documentation",
  description: "Complete API documentation for Feeds - Developer-friendly feed hosting platform. Learn how to create feeds, manage posts, and integrate with your applications.",
  openGraph: {
    title: "Feeds API Documentation",
    description: "Complete API documentation for Feeds platform",
    type: "website",
  },
}

export default function DocsPage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  const baseUrl = siteUrl

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-4">Feeds API Documentation</h1>
            <p className="text-lg text-muted-foreground">
              Complete guide to integrating with the Feeds platform. Create feeds, manage posts, and build powerful content applications.
            </p>
          </div>

          <div className="space-y-12">
            {/* Overview */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <Book className="h-6 w-6" />
                Overview
              </h2>
              <div className="prose prose-sm max-w-none">
                <p>
                  Feeds is a developer-friendly feed hosting platform that allows you to create and manage content feeds programmatically. 
                  All API requests require authentication using an API key.
                </p>
                <ul>
                  <li><strong>Base URL:</strong> <code>{baseUrl}/api</code></li>
                  <li><strong>Authentication:</strong> Bearer token (API key)</li>
                  <li><strong>Content-Type:</strong> <code>application/json</code></li>
                  <li><strong>Rate Limiting:</strong> Standard rate limits apply</li>
                </ul>
              </div>
            </section>

            {/* Authentication */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <Key className="h-6 w-6" />
                Authentication
              </h2>
              <div className="prose prose-sm max-w-none">
                <p>
                  All API endpoints require authentication using your API key. Get your API key from your profile page after signing in.
                </p>
                <p><strong>Header Format:</strong></p>
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
{`Authorization: Bearer YOUR_API_KEY`}
                </pre>
                <p><strong>Example:</strong></p>
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
{`curl -X GET ${baseUrl}/api/feeds \\
  -H "Authorization: Bearer YOUR_API_KEY"`}
                </pre>
              </div>
            </section>

            {/* Endpoints */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <Code className="h-6 w-6" />
                API Endpoints
              </h2>

              <div className="space-y-8">
                {/* Get Feeds */}
                <div className="border rounded-lg p-6">
                  <h3 className="text-xl font-semibold mb-2">GET /api/feeds</h3>
                  <p className="text-muted-foreground mb-4">Retrieve all feeds for the authenticated user</p>
                  <div className="space-y-3">
                    <div>
                      <p className="font-semibold text-sm">Request:</p>
                      <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
{`GET ${baseUrl}/api/feeds
Authorization: Bearer YOUR_API_KEY`}
                      </pre>
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Response (200 OK):</p>
                      <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
{`[
  {
    "id": "feed_id",
    "title": "My Feed",
    "description": "Feed description",
    "slug": "my-feed",
    "userId": "user_id",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "posts": [...]
  }
]`}
                      </pre>
                    </div>
                  </div>
                </div>

                {/* Create Feed */}
                <div className="border rounded-lg p-6">
                  <h3 className="text-xl font-semibold mb-2">POST /api/feeds</h3>
                  <p className="text-muted-foreground mb-4">Create a new feed</p>
                  <div className="space-y-3">
                    <div>
                      <p className="font-semibold text-sm">Request:</p>
                      <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
{`POST ${baseUrl}/api/feeds
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json

{
  "title": "My New Feed",
  "description": "Optional description"
}`}
                      </pre>
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Response (201 Created):</p>
                      <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
{`{
  "id": "feed_id",
  "title": "My New Feed",
  "description": "Optional description",
  "slug": "my-new-feed",
  "userId": "user_id",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}`}
                      </pre>
                    </div>
                  </div>
                </div>

                {/* Create Post */}
                <div className="border rounded-lg p-6">
                  <h3 className="text-xl font-semibold mb-2">POST /api/posts</h3>
                  <p className="text-muted-foreground mb-4">Create a new post in a feed</p>
                  <div className="space-y-3">
                    <div>
                      <p className="font-semibold text-sm">Request:</p>
                      <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
{`POST ${baseUrl}/api/posts
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json

{
  "feedId": "feed_id",
  "type": "text",
  "content": "Post content"
}`}
                      </pre>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      <strong>Post Types:</strong> <code>text</code>, <code>image</code>, <code>video</code>, <code>url</code>
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Feeds */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <Rss className="h-6 w-6" />
                Public Feeds (RSS & JSON)
              </h2>
              <div className="prose prose-sm max-w-none">
                <p>
                  Public feeds are available in RSS and JSON Feed formats. These endpoints don&apos;t require authentication.
                </p>
                <ul>
                  <li><strong>RSS Feed:</strong> <code>{baseUrl}/feeds/[username]/[feedTitle]/rss</code></li>
                  <li><strong>JSON Feed:</strong> <code>{baseUrl}/feeds/[username]/[feedTitle]/json</code></li>
                </ul>
                <p className="text-sm text-muted-foreground">
                  Example: <code>{baseUrl}/feeds/johndoe/my-feed/rss</code>
                </p>
              </div>
            </section>

            {/* Error Handling */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Error Handling</h2>
              <div className="prose prose-sm max-w-none">
                <p>All errors follow a consistent format:</p>
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
{`{
  "error": "Error message"
}`}
                </pre>
                <p><strong>Common Status Codes:</strong></p>
                <ul>
                  <li><code>400</code> - Bad Request (invalid input)</li>
                  <li><code>401</code> - Unauthorized (invalid or missing API key)</li>
                  <li><code>403</code> - Forbidden (access denied)</li>
                  <li><code>404</code> - Not Found</li>
                  <li><code>500</code> - Internal Server Error</li>
                </ul>
              </div>
            </section>

            {/* Rate Limits */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Rate Limits</h2>
              <div className="prose prose-sm max-w-none">
                <p>
                  Standard rate limits apply to prevent abuse. If you exceed the rate limit, you&apos;ll receive a <code>429 Too Many Requests</code> response.
                </p>
              </div>
            </section>

            {/* Getting Started */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Getting Started</h2>
              <div className="prose prose-sm max-w-none">
                <ol>
                  <li>Sign up or log in to your account</li>
                  <li>Navigate to your profile page</li>
                  <li>Enable Developer Mode to view your API key</li>
                  <li>Copy your API key</li>
                  <li>Start making API requests using the examples above</li>
                </ol>
                <p>
                  <Link href="/login" className="text-primary hover:underline">Get started by creating an account →</Link>
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

