-- Dev Feeds initial schema (matches prisma/schema.prisma)

CREATE TABLE "User" (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE,
  "lastUsernameChange" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX "User_username_idx" ON "User" (username);

CREATE TABLE "Feed" (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  slug TEXT NOT NULL,
  "userId" TEXT NOT NULL REFERENCES "User" (id),
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "fontFamily" TEXT,
  "fontColor" TEXT,
  "secondaryTextColor" TEXT,
  "cardBgColor" TEXT,
  "cardBorderColor" TEXT,
  "feedBgColor" TEXT,
  "buttonColor" TEXT,
  "buttonSecondaryColor" TEXT,
  UNIQUE ("userId", slug)
);

CREATE INDEX "Feed_userId_idx" ON "Feed" ("userId");

CREATE TABLE "Post" (
  id TEXT PRIMARY KEY,
  "feedId" TEXT NOT NULL REFERENCES "Feed" (id) ON DELETE CASCADE,
  content TEXT,
  "imageUrl" TEXT,
  "videoUrl" TEXT,
  url TEXT,
  type TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX "Post_feedId_idx" ON "Post" ("feedId");

CREATE TABLE "ApiKey" (
  id TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL UNIQUE REFERENCES "User" (id),
  key TEXT NOT NULL UNIQUE,
  name TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "lastUsedAt" TIMESTAMPTZ
);

CREATE INDEX "ApiKey_userId_idx" ON "ApiKey" ("userId");
CREATE INDEX "ApiKey_key_idx" ON "ApiKey" (key);

CREATE OR REPLACE FUNCTION feeds_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_updated_at
  BEFORE UPDATE ON "User"
  FOR EACH ROW
  EXECUTE FUNCTION feeds_set_updated_at();

CREATE TRIGGER feed_updated_at
  BEFORE UPDATE ON "Feed"
  FOR EACH ROW
  EXECUTE FUNCTION feeds_set_updated_at();

CREATE TRIGGER post_updated_at
  BEFORE UPDATE ON "Post"
  FOR EACH ROW
  EXECUTE FUNCTION feeds_set_updated_at();
