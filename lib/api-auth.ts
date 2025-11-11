import { NextRequest } from "next/server"
import { getCurrentUser, validateApiKey } from "@/lib/auth"

export async function authenticateRequest(request: NextRequest) {
  // Try API key authentication first
  const authHeader = request.headers.get("authorization")
  if (authHeader?.startsWith("Bearer ")) {
    const apiKey = authHeader.substring(7)
    const apiKeyRecord = await validateApiKey(apiKey)
    if (apiKeyRecord) {
      return { userId: apiKeyRecord.userId, method: "api_key" as const }
    }
  }

  // Fall back to session authentication
  const user = await getCurrentUser()
  if (user) {
    return { userId: user.id, method: "session" as const }
  }

  return null
}

