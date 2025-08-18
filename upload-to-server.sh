#!/bin/bash

# Upload script for Tusgal Next.js application
SERVER_IP="157.230.252.228"
SERVER_USER="root"
APP_DIR="/var/www/tusgal-app"

echo "🚀 Uploading application to server..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if we're in the right directory
if [ ! -d "frontend-next" ]; then
    print_warning "frontend-next directory not found. Make sure you're in the project root."
    exit 1
fi

print_status "Uploading application files to server..."

# Create a temporary directory for upload
TEMP_DIR=$(mktemp -d)
cp -r frontend-next/* $TEMP_DIR/

# Remove unnecessary files to reduce upload size
cd $TEMP_DIR
rm -rf node_modules .next .git

# Upload files using rsync
rsync -avz --progress $TEMP_DIR/ $SERVER_USER@$SERVER_IP:$APP_DIR/

# Clean up
rm -rf $TEMP_DIR

print_status "Upload completed!"
print_status "Next steps:"
print_status "1. SSH into your server: ssh $SERVER_USER@$SERVER_IP"
print_status "2. Navigate to the app directory: cd $APP_DIR"
print_status "3. Follow the deployment steps in deployment-steps.md"
print_status "4. Set up your environment variables"
print_status "5. Install dependencies and build the application"
