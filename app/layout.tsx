import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/auth-context";
import { FeedStylesProvider } from "@/context/feed-styles-context";
import { Navbar } from "@/components/navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Dev Feeds - Developer-Friendly Feed Hosting",
  description: "Create and host developer-friendly feeds with text, image, and video posts",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
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

