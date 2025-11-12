export function RootStructuredData() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://feeds-pink.vercel.app"
  
  // Organization schema
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Feeds",
    url: siteUrl,
    description: "Developer-friendly feed hosting platform for creating and sharing content feeds with text, image, video, and URL posts",
    sameAs: [
      // Add social media links when available
      // "https://twitter.com/feeds",
      // "https://github.com/feeds",
    ],
  }

  // WebSite schema
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Feeds",
    url: siteUrl,
    description: "Create and host developer-friendly feeds with text, image, video, and URL posts. Share your content with customizable feeds.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/feeds?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  }

  // SoftwareApplication schema
  const softwareApplicationSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Feeds",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description: "Developer-friendly feed hosting platform. Create customizable feeds, manage posts via API, and share your content with the world.",
    featureList: [
      "Create and manage multiple feeds",
      "Post text, images, videos, and URLs",
      "RESTful API for programmatic access",
      "Customizable feed styling",
      "RSS and JSON feed support",
      "Public feed sharing",
    ],
    url: siteUrl,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationSchema) }}
      />
    </>
  )
}

