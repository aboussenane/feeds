#!/bin/bash

# Deployment script for Dev Feeds on VM
# This script helps deploy the application to a remote server

set -e

VM_IP="143.198.132.156"
APP_DIR="~/dev-feeds"
APP_PORT="3001"  # Changed from 3000 to avoid conflict with n8n

echo "🚀 Dev Feeds Deployment Script"
echo "================================"
echo ""

# Check if we're deploying locally or remotely
if [ "$1" == "remote" ]; then
    echo "📦 Deploying to remote VM: $VM_IP"
    echo ""
    
    # Check if .env file exists locally
    if [ ! -f .env ]; then
        echo "⚠️  Warning: .env file not found locally"
        echo "   Make sure to create .env on the remote server"
    fi
    
    # Create deployment package (exclude node_modules, .next, etc.)
    echo "📦 Creating deployment package..."
    tar --exclude='node_modules' \
        --exclude='.next' \
        --exclude='.git' \
        --exclude='uploads' \
        --exclude='*.log' \
        -czf dev-feeds-deploy.tar.gz .
    
    echo "📤 Uploading to server..."
    scp dev-feeds-deploy.tar.gz root@$VM_IP:$APP_DIR/
    
    echo "🔧 Running deployment on server..."
    ssh root@$VM_IP << EOF
        set -e
        cd $APP_DIR
        
        # Extract files
        echo "📦 Extracting files..."
        tar -xzf dev-feeds-deploy.tar.gz
        rm dev-feeds-deploy.tar.gz
        
        # Update docker-compose port if needed
        if ! grep -q "3001:3000" docker-compose.yml; then
            sed -i 's/"3000:3000"/"3001:3000"/g' docker-compose.yml
        fi
        
        # Build and restart
        echo "🏗️  Building Docker image..."
        docker-compose build
        
        echo "🔄 Restarting containers..."
        docker-compose down
        docker-compose up -d
        
        echo "✅ Deployment complete!"
        echo "📊 Container status:"
        docker-compose ps
        
        echo ""
        echo "🌐 Application should be available at: http://$VM_IP:$APP_PORT"
EOF
    
    # Clean up local tar file
    rm dev-feeds-deploy.tar.gz
    
    echo ""
    echo "✅ Deployment complete!"
    echo "🌐 Access your app at: http://$VM_IP:$APP_PORT"
    
elif [ "$1" == "setup" ]; then
    echo "🔧 Setting up deployment environment on VM..."
    echo ""
    
    ssh root@$VM_IP << EOF
        set -e
        
        # Create app directory
        mkdir -p $APP_DIR
        cd $APP_DIR
        
        echo "✅ Directory created: $APP_DIR"
        echo ""
        echo "📝 Next steps:"
        echo "1. Create .env file in $APP_DIR with your environment variables"
        echo "2. Run: ./deploy.sh remote"
EOF
    
else
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  setup   - Set up deployment directory on remote VM"
    echo "  remote  - Deploy to remote VM"
    echo ""
    echo "Example:"
    echo "  $0 setup    # First time setup"
    echo "  $0 remote   # Deploy application"
fi

