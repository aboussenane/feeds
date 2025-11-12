#!/bin/bash

echo "=== Docker Build Troubleshooting ==="
echo ""

# Check Docker version
echo "1. Docker Version:"
docker --version
docker compose version
echo ""

# Check Docker daemon
echo "2. Docker Daemon Status:"
docker info > /dev/null 2>&1 && echo "✓ Docker daemon is running" || echo "✗ Docker daemon is NOT running"
echo ""

# Check environment variables
echo "3. Environment Variables Check:"
if [ -f .env ]; then
    echo "✓ .env file exists"
    if grep -q "NEXT_PUBLIC_SUPABASE_URL" .env; then
        echo "✓ NEXT_PUBLIC_SUPABASE_URL is set"
    else
        echo "✗ NEXT_PUBLIC_SUPABASE_URL is MISSING"
    fi
    if grep -q "NEXT_PUBLIC_SUPABASE_ANON_KEY" .env; then
        echo "✓ NEXT_PUBLIC_SUPABASE_ANON_KEY is set"
    else
        echo "✗ NEXT_PUBLIC_SUPABASE_ANON_KEY is MISSING"
    fi
    if grep -q "DATABASE_URL" .env; then
        echo "✓ DATABASE_URL is set"
    else
        echo "✗ DATABASE_URL is MISSING"
    fi
else
    echo "✗ .env file is MISSING"
fi
echo ""

# Check required files
echo "4. Required Files Check:"
[ -f "Dockerfile" ] && echo "✓ Dockerfile exists" || echo "✗ Dockerfile missing"
[ -f "docker-compose.yml" ] && echo "✓ docker-compose.yml exists" || echo "✗ docker-compose.yml missing"
[ -f "package.json" ] && echo "✓ package.json exists" || echo "✗ package.json missing"
[ -f "package-lock.json" ] && echo "✓ package-lock.json exists" || echo "✗ package-lock.json missing"
[ -f "prisma/schema.prisma" ] && echo "✓ prisma/schema.prisma exists" || echo "✗ prisma/schema.prisma missing"
echo ""

# Check disk space
echo "5. Disk Space:"
df -h . | tail -1
echo ""

# Check architecture
echo "6. System Architecture:"
uname -m
echo ""

# Check if .env variables are exported
echo "7. Environment Variables Export Check:"
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
    echo "⚠ NEXT_PUBLIC_SUPABASE_URL is not exported (will use .env file)"
else
    echo "✓ NEXT_PUBLIC_SUPABASE_URL is exported"
fi
if [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
    echo "⚠ NEXT_PUBLIC_SUPABASE_ANON_KEY is not exported (will use .env file)"
else
    echo "✓ NEXT_PUBLIC_SUPABASE_ANON_KEY is exported"
fi
if [ -z "$DATABASE_URL" ]; then
    echo "⚠ DATABASE_URL is not exported (will use .env file)"
else
    echo "✓ DATABASE_URL is exported"
fi
echo ""

echo "=== Next Steps ==="
echo "If environment variables are missing, make sure your .env file exists and contains:"
echo "  NEXT_PUBLIC_SUPABASE_URL=..."
echo "  NEXT_PUBLIC_SUPABASE_ANON_KEY=..."
echo "  DATABASE_URL=..."
echo ""
echo "To see the actual build error, run:"
echo "  docker-compose build --no-cache 2>&1 | tee build.log"

