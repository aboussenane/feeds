/**
 * Script to populate User records for existing feeds and API keys
 * Run this before applying the schema migration
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Populating User records for existing data...')

  // Get all unique userIds from feeds
  const feedUserIds = await prisma.$queryRaw<Array<{ userId: string }>>`
    SELECT DISTINCT "userId" FROM "Feed"
  `

  // Get all unique userIds from API keys
  const apiKeyUserIds = await prisma.$queryRaw<Array<{ userId: string }>>`
    SELECT DISTINCT "userId" FROM "ApiKey"
  `

  // Combine and deduplicate
  const allUserIds = new Set([
    ...feedUserIds.map(f => f.userId),
    ...apiKeyUserIds.map(a => a.userId),
  ])

  console.log(`Found ${allUserIds.size} unique user IDs`)

  // Create User records for each userId
  for (const userId of allUserIds) {
    try {
      await prisma.$executeRaw`
        INSERT INTO "User" (id, "createdAt", "updatedAt")
        VALUES (${userId}, NOW(), NOW())
        ON CONFLICT (id) DO NOTHING
      `
    } catch (error) {
      console.error(`Error creating user ${userId}:`, error)
    }
  }

  console.log('Done populating User records')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

