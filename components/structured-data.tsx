import { Feed, Post } from "@prisma/client"

type FeedWithPosts = Feed & {
  posts: Post[]
}

type StructuredDataProps = {
  feed: FeedWithPosts
  username: string
  feedTitle: string
}

export function StructuredData({ feed, username, feedTitle }: StructuredDataProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  const feedUrl = `${siteUrl}/feeds/${username}/${feedTitle}`

  // Blog/BlogPosting structured data
  const blogStructuredData = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: feed.title,
    description: feed.description || `${feed.title} feed by ${username}`,
    url: feedUrl,
    author: {
      "@type": "Person",
      name: username,
    },
    blogPost: feed.posts.map((post) => ({
      "@type": "BlogPosting",
      headline: post.content?.substring(0, 100) || "Post",
      description: post.content?.substring(0, 200) || "",
      datePublished: post.createdAt,
      dateModified: post.updatedAt,
      author: {
        "@type": "Person",
        name: username,
      },
      image: post.imageUrl || post.videoUrl || undefined,
      url: `${feedUrl}#post-${post.id}`,
    })),
  }

  // CollectionPage structured data
  const collectionStructuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: feed.title,
    description: feed.description || `${feed.title} feed`,
    url: feedUrl,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: feed.posts.length,
      itemListElement: feed.posts.map((post, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "BlogPosting",
          headline: post.content?.substring(0, 100) || "Post",
          datePublished: post.createdAt,
          url: `${feedUrl}#post-${post.id}`,
        },
      })),
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogStructuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionStructuredData) }}
      />
    </>
  )
}

