# Deployment Guide for VM

This guide helps you deploy Dev Feeds to your VM at `143.198.132.156` where n8n is already running.

## Prerequisites

- SSH access to the VM
- Docker and Docker Compose installed on the VM
- Your environment variables ready

## Quick Deployment

### Option 1: Using the Deployment Script

1. **First time setup** (creates directory on VM):
   ```bash
   chmod +x deploy.sh
   ./deploy.sh setup
   ```

2. **SSH into the VM and create .env file**:
   ```bash
   ssh root@143.198.132.156
   cd ~/dev-feeds
   nano .env
   ```
   
   Add your environment variables:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   DATABASE_URL=your_database_url
   ```

3. **Deploy from your local machine**:
   ```bash
   ./deploy.sh remote
   ```

### Option 2: Manual Deployment

1. **SSH into the VM**:
   ```bash
   ssh root@143.198.132.156
   ```

2. **Create app directory**:
   ```bash
   mkdir -p ~/dev-feeds
   cd ~/dev-feeds
   ```

3. **Upload your code** (from your local machine):
   ```bash
   # From your local machine
   scp -r /path/to/dev-feeds/* root@143.198.132.156:~/dev-feeds/
   ```

4. **Create .env file on the VM**:
   ```bash
   # On the VM
   cd ~/dev-feeds
   nano .env
   ```
   
   Add:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   DATABASE_URL=your_database_url
   ```

5. **Update docker-compose.yml port** (if not already done):
   ```bash
   # Change port from 3000 to 3001 to avoid conflict with n8n
   sed -i 's/"3000:3000"/"3001:3000"/g' docker-compose.yml
   ```

6. **Build and start the container**:
   ```bash
   # Try Docker Compose v2 first (plugin)
   docker compose build
   docker compose up -d
   
   # Or if that doesn't work, use v1 (standalone)
   docker-compose build
   docker-compose up -d
   ```

7. **Check status**:
   ```bash
   # Docker Compose v2 (plugin)
   docker compose ps
   docker compose logs -f
   
   # Or Docker Compose v1 (standalone)
   docker-compose ps
   docker-compose logs -f
   ```

## Port Configuration

- **Dev Feeds**: Running on port **3001** (external) → 3000 (internal)
- **n8n**: Likely running on port **5678** or **3000**

The docker-compose.yml is configured to use port 3001 externally to avoid conflicts.

## Verify Deployment

1. **Check if container is running**:
   ```bash
   docker ps | grep dev-feeds
   ```

2. **Check logs**:
   ```bash
   docker-compose logs -f dev-feeds
   ```

3. **Test health endpoint**:
   ```bash
   curl http://localhost:3001/api/health
   ```

4. **Access the application**:
   - Open: `http://143.198.132.156:3001`

## Updating the Application

### Using the script:
```bash
./deploy.sh remote
```

### Manual update:
```bash
# SSH into VM
ssh root@143.198.132.156
cd ~/dev-feeds

# Pull latest code (if using git)
git pull

# Rebuild and restart
docker-compose down
docker-compose build
docker-compose up -d
```

## Troubleshooting

### Port already in use
If port 3001 is also in use, change it in `docker-compose.yml`:
```yaml
ports:
  - "3002:3000"  # Use any available port
```

### Container won't start
```bash
# Check logs
docker-compose logs dev-feeds

# Check if port is available
netstat -tulpn | grep 3001

# Check Docker status
docker ps -a
```

### Database connection issues
- Verify your `DATABASE_URL` in `.env` is correct
- Ensure your Supabase database is accessible from the VM
- Check firewall rules

### Permission issues with uploads
```bash
# On the VM
cd ~/dev-feeds
mkdir -p uploads
chmod 755 uploads
```

## Reverse Proxy Setup (Optional)

If you want to use a domain name instead of IP:port, set up nginx:

```nginx
# /etc/nginx/sites-available/dev-feeds
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Then enable it:
```bash
ln -s /etc/nginx/sites-available/dev-feeds /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

## Monitoring

### View logs:
```bash
docker-compose logs -f dev-feeds
```

### Check resource usage:
```bash
docker stats dev-feeds
```

### Restart container:
```bash
docker-compose restart dev-feeds
```

## Security Notes

1. **Firewall**: Make sure port 3001 is open if accessing from outside
   ```bash
   # Ubuntu/Debian
   ufw allow 3001/tcp
   
   # CentOS/RHEL
   firewall-cmd --add-port=3001/tcp --permanent
   firewall-cmd --reload
   ```

2. **Environment Variables**: Never commit `.env` file to git

3. **SSH Keys**: Use SSH keys instead of passwords for better security

## Next Steps

1. Set up SSL/TLS with Let's Encrypt
2. Configure a reverse proxy (nginx)
3. Set up monitoring and logging
4. Configure automatic backups for uploads directory

