"use client"

import Link from "next/link"
import { useAuth } from "@/context/auth-context"
import { useFeedStyles } from "@/context/feed-styles-context"
import { Button } from "@/components/ui/button"
import { User, LogIn } from "lucide-react"

export function Navbar() {
  const { user, loading } = useAuth()
  const { styles } = useFeedStyles()

  const navStyle: React.CSSProperties = {
    backgroundColor: styles?.feedBgColor || undefined,
    borderColor: styles?.cardBorderColor || undefined,
  }

  return (
    <nav 
      className="border-b backdrop-blur supports-[backdrop-filter]:bg-background/60"
      style={navStyle}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="text-xl font-bold">
            Dev Feeds
          </Link>
          
          <div className="flex items-center gap-4">
            {!loading && (
              <>
                {user ? (
                  <>
                    <Link href="/profile">
                      <Button variant="ghost" size="sm" className="gap-2">
                        <User className="h-4 w-4" />
                        Profile
                      </Button>
                    </Link>
                  </>
                ) : (
                  <Link href="/login">
                    <Button variant="outline" size="sm" className="gap-2">
                      <LogIn className="h-4 w-4" />
                      Login
                    </Button>
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

