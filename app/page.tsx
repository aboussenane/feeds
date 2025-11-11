import Link from "next/link";
import { Plus, Rss } from "lucide-react";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export default async function HomePage() {
  const user = await getCurrentUser();
  
  // Only fetch feeds if user is logged in, and only show their own feeds
  const feeds = user
    ? await prisma.feed.findMany({
        where: {
          userId: user.id,
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      })
    : [];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Dev Feeds</h1>
            <p className="text-muted-foreground text-lg mb-8">
              Create and host developer-friendly feeds with text, image, and video posts
            </p>
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
                {feeds.map((feed) => (
                  <Link
                    key={feed.id}
                    href={`/feeds/${feed.userId}/${feed.slug}`}
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
                          /feeds/{feed.userId}/{feed.slug}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

