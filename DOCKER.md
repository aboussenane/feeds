# Docker Setup Guide

This guide explains how to run Dev Feeds in a Docker container.

## Prerequisites

- Docker installed on your system
- Docker Compose (usually included with Docker Desktop)
- Environment variables configured (see `.env.example`)

## Quick Start

1. **Create a `.env` file** with your configuration:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
DATABASE_URL=your_supabase_postgres_connection_string
```

2. **Build and run with Docker Compose**:
```bash
docker-compose up -d
```

3. **Access the application**:
   - Open http://localhost:3000 in your browser

## Manual Docker Commands

### Build the image:
```bash
docker build -t dev-feeds .
```

### Run the container:
```bash
docker run -d \
  --name dev-feeds \
  -p 3000:3000 \
  -v $(pwd)/uploads:/app/public/uploads \
  --env-file .env \
  dev-feeds
```

### View logs:
```bash
docker-compose logs -f
# or
docker logs -f dev-feeds
```

### Stop the container:
```bash
docker-compose down
# or
docker stop dev-feeds
```

### Remove the container:
```bash
docker-compose down -v
# or
docker rm -f dev-feeds
```

## Volume Mounts

The `uploads` directory is mounted as a volume to persist large video files across container restarts:

```yaml
volumes:
  - ./uploads:/app/public/uploads
```

This ensures that files uploaded to the local storage (files >50MB) are not lost when the container is restarted.

## Environment Variables

Create a `.env` file in the project root with:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
DATABASE_URL=postgresql://user:password@host:5432/database
```

**Important**: Never commit your `.env` file to version control!

## Production Considerations

### 1. Reverse Proxy

For production, use a reverse proxy (nginx, Traefik, etc.) in front of the container:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 2. SSL/TLS

Use Let's Encrypt or another SSL provider with your reverse proxy.

### 3. Database Migrations

Run Prisma migrations before starting the container:

```bash
# On your host machine
npx prisma migrate deploy
# or
npx prisma db push
```

Or add a migration step to your Dockerfile if needed.

### 4. Health Checks

The container includes a health check that monitors the application. Check status with:

```bash
docker ps
```

### 5. Resource Limits

For production, consider adding resource limits to `docker-compose.yml`:

```yaml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

## Troubleshooting

### Container won't start

1. Check logs: `docker-compose logs`
2. Verify environment variables are set correctly
3. Ensure port 3000 is not already in use

### Uploads not persisting

1. Verify the volume mount: `docker inspect dev-feeds | grep Mounts`
2. Check directory permissions: `ls -la uploads/`
3. Ensure the `uploads` directory exists on the host

### Database connection errors

1. Verify `DATABASE_URL` is correct
2. Check if your Supabase database is accessible
3. Ensure network connectivity from container

### Build errors

1. Clear Docker cache: `docker builder prune`
2. Rebuild without cache: `docker-compose build --no-cache`
3. Check Node.js version compatibility

## Development vs Production

### Development

For development, you might want to mount the source code:

```yaml
volumes:
  - .:/app
  - /app/node_modules
  - /app/.next
```

### Production

The current setup uses a multi-stage build for optimal production performance:
- Smaller image size
- Faster startup
- Better security (non-root user)

## Updating the Application

1. Pull latest changes
2. Rebuild: `docker-compose build`
3. Restart: `docker-compose up -d`

Or use a single command:
```bash
docker-compose up -d --build
```

