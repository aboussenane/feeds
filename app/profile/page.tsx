import { redirect } from "next/navigation"
import { getCurrentUser, getOrCreateApiKey, getOrCreateUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ProfileContent } from "@/components/profile-content"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default async function ProfilePage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect("/login")
  }

  const dbUser = await getOrCreateUser(user.id)
  const apiKey = await getOrCreateApiKey(user.id)
  const feeds = await prisma.feed.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { posts: true },
      },
    },
  })

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8">
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>

          <ProfileContent 
            user={user} 
            dbUser={dbUser}
            apiKey={apiKey.key} 
            feeds={feeds} 
          />
        </div>
      </div>
    </div>
  )
}

