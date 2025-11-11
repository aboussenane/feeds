import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Ensure DATABASE_URL has SSL parameters for Supabase
// Remove quotes if present (sometimes .env files have quotes)
const databaseUrl = process.env.DATABASE_URL?.replace(/^["']|["']$/g, '') || ''
let connectionString = databaseUrl

if (databaseUrl) {
  // For connection pooler URLs (pgbouncer), ensure pgbouncer=true is present
  const isPooler = databaseUrl.includes('pooler.supabase.com') || databaseUrl.includes('pgbouncer=true')
  
  if (!databaseUrl.includes('?')) {
    // No query params - add SSL and connection timeout
    connectionString = isPooler 
      ? `${databaseUrl}?pgbouncer=true&sslmode=require&connect_timeout=30`
      : `${databaseUrl}?sslmode=require&connect_timeout=30`
  } else {
    // Has query params - add missing ones
    if (isPooler && !databaseUrl.includes('pgbouncer=true')) {
      connectionString = `${databaseUrl}&pgbouncer=true`
    }
    if (!databaseUrl.includes('sslmode=')) {
      connectionString = `${connectionString}&sslmode=require`
    }
    if (!databaseUrl.includes('connect_timeout=')) {
      connectionString = `${connectionString}&connect_timeout=30`
    }
  }
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: connectionString,
    },
  },
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

