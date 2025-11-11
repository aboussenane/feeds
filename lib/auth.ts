import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function getCurrentUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  return user
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Unauthorized')
  }
  return user
}

export async function getOrCreateApiKey(userId: string) {
  let apiKey = await prisma.apiKey.findUnique({
    where: { userId },
  })

  if (!apiKey) {
    // Generate a new API key
    const key = `df_${Buffer.from(`${userId}-${Date.now()}`).toString('base64url')}`
    apiKey = await prisma.apiKey.create({
      data: {
        userId,
        key,
      },
    })
  }

  return apiKey
}

export async function validateApiKey(key: string) {
  const apiKey = await prisma.apiKey.findUnique({
    where: { key },
  })

  if (!apiKey) {
    return null
  }

  // Update last used timestamp
  await prisma.apiKey.update({
    where: { id: apiKey.id },
    data: { lastUsedAt: new Date() },
  })

  return apiKey
}

export async function regenerateApiKey(userId: string) {
  // Delete the old API key if it exists
  await prisma.apiKey.deleteMany({
    where: { userId },
  })

  // Generate a new API key
  const key = `df_${Buffer.from(`${userId}-${Date.now()}`).toString('base64url')}`
  const apiKey = await prisma.apiKey.create({
    data: {
      userId,
      key,
    },
  })

  return apiKey
}

