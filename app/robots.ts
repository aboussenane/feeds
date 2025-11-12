import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://feeds-pink.vercel.app'
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/login', '/profile', '/feeds/new'],
      },
      {
        userAgent: '*',
        allow: '/feeds/',
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}

