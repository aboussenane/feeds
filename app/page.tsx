import Link from "next/link";
import { Metadata } from "next";
import { Plus, Rss } from "lucide-react";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, getOrCreateUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Home",
  description: "Create and host developer-friendly feeds with text, image, video, and URL posts. Share your content with customizable feeds.",
  openGraph: {
    title: "Feeds - Developer-Friendly Feed Hosting",
    description: "Create and host developer-friendly feeds with text, image, video, and URL posts",
    type: "website",
  },
};

export default async function HomePage() {
  const user = await getCurrentUser();
  
  // Only fetch feeds if user is logged in, and only show their own feeds
  const feeds = user
    ? await (prisma as any).feed.findMany({
        where: {
          userId: user.id,
        },
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          user: {
            select: {
              username: true,
            },
          },
        },
      })
    : [];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Feeds</h1>
            <p className="text-muted-foreground text-lg mb-8">
              Developer-friendly feed hosting platform. Create and share customizable content feeds with text, images, videos, and URLs. RESTful API, RSS, and JSON Feed support.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-6 mb-6">
              <Link href="/what-is-feeds">
                <Button variant="outline">What is Feeds?</Button>
              </Link>
              <Link href="/how-to-create-feeds">
                <Button variant="outline">How to Create Feeds</Button>
              </Link>
              <Link href="/docs">
                <Button variant="outline">API Documentation</Button>
              </Link>
            </div>
            {user ? (
              <Link href="/feeds/new">
                <Button size="lg" className="gap-2">
                  <Plus className="h-5 w-5" />
                  Create New Feed
                </Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button size="lg" className="gap-2">
                  Get Started
                </Button>
              </Link>
            )}
          </div>

          {feeds.length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl font-semibold mb-6">Recent Feeds</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {feeds.map((feed: any) => {
                  const username = feed.user?.username || feed.userId;
                  // Normalize username to lowercase for URLs
                  const normalizedUsername = username ? username.toLowerCase() : username;
                  return (
                    <Link
                      key={feed.id}
                      href={`/feeds/${normalizedUsername}/${feed.slug}`}
                      className="block p-6 border rounded-lg hover:bg-accent transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <Rss className="h-5 w-5 text-primary mt-1" />
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1">{feed.title}</h3>
                          {feed.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {feed.description}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-2">
                            /feeds/{normalizedUsername}/{feed.slug}
                          </p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

