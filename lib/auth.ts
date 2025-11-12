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

/**
 * Get or create a user record in the database
 */
export async function getOrCreateUser(userId: string) {
  let user = await (prisma as any).user.findUnique({
    where: { id: userId },
  })

  if (!user) {
    user = await (prisma as any).user.create({
      data: {
        id: userId,
      },
    })
  }

  return user
}

/**
 * Get user by username (case-insensitive)
 * Usernames are stored in lowercase, so we normalize the input
 */
export async function getUserByUsername(username: string) {
  // Normalize to lowercase for lookup (usernames are stored in lowercase)
  const normalizedUsername = username.toLowerCase()
  
  // Direct lookup since usernames are stored in lowercase
  return await (prisma as any).user.findUnique({
    where: { username: normalizedUsername },
    include: {
      feeds: {
        include: {
          posts: {
            orderBy: { createdAt: "desc" },
          },
        },
      },
    },
  })
}

/**
 * Update username with 7-day cooldown validation
 */
export async function updateUsername(userId: string, newUsername: string) {
  // Validate username format
  if (!/^[a-zA-Z0-9_-]{3,20}$/.test(newUsername)) {
    throw new Error('Username must be 3-20 characters and contain only letters, numbers, underscores, and hyphens')
  }

  // Normalize to lowercase
  const normalizedUsername = newUsername.toLowerCase()

  // Get current user
  const user = await getOrCreateUser(userId)

  // Check if username is already taken (usernames are stored in lowercase)
  const existingUser = await (prisma as any).user.findUnique({
    where: { username: normalizedUsername },
  })

  if (existingUser && existingUser.id !== userId) {
    throw new Error('Username is already taken')
  }

  // Check 7-day cooldown
  if (user.lastUsernameChange) {
    const daysSinceChange = (Date.now() - new Date(user.lastUsernameChange).getTime()) / (1000 * 60 * 60 * 24)
    if (daysSinceChange < 7) {
      const daysRemaining = Math.ceil(7 - daysSinceChange)
      throw new Error(`You can only change your username once every 7 days. Please try again in ${daysRemaining} day${daysRemaining === 1 ? '' : 's'}.`)
    }
  }

  // Update username (store in lowercase)
  const updatedUser = await (prisma as any).user.update({
    where: { id: userId },
    data: {
      username: normalizedUsername,
      lastUsernameChange: new Date(),
    },
  })

  return updatedUser
}

