import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/auth-context";
import { FeedStylesProvider } from "@/context/feed-styles-context";
import { Navbar } from "@/components/navbar";
import { RootStructuredData } from "@/components/root-structured-data";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Feeds - Developer-Friendly Feed Hosting",
    template: "%s | Feeds",
  },
  description: "Feeds — Developer-friendly feed hosting platform. Create and share customizable content feeds with text, images, videos, and URLs. RESTful API, RSS, and JSON Feed support.",
  keywords: ["feeds", "developer feeds", "content hosting", "RSS", "JSON feed", "blog", "developer tools", "content management", "feed API"],
  authors: [{ name: "Feeds" }],
  creator: "Feeds",
  publisher: "Feeds",
      metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://feeds-pink.vercel.app"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Feeds",
    title: "Feeds — Developer-Friendly Feed Hosting",
    description: "Feeds — Developer-friendly feed hosting platform. Create and share customizable content feeds with text, images, videos, and URLs. RESTful API, RSS, and JSON Feed support.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Feeds — Developer-Friendly Feed Hosting",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Feeds — Developer-Friendly Feed Hosting",
    description: "Feeds — Developer-friendly feed hosting platform. Create and share customizable content feeds with text, images, videos, and URLs. RESTful API, RSS, and JSON Feed support.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Add your verification codes here when available
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <RootStructuredData />
        <AuthProvider>
          <FeedStylesProvider>
            <Navbar />
            {children}
          </FeedStylesProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

