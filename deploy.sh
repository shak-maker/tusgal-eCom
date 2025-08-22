#!/bin/bash

# Tusgal E-commerce Deployment Script
# This script automates the deployment process on your server

set -e  # Exit on any error

echo "🚀 Starting Tusgal deployment process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ] && [ ! -d "frontend-next" ]; then
    print_error "This script must be run from the project root directory"
    exit 1
fi

# Navigate to frontend-next directory if we're in the root
if [ -d "frontend-next" ]; then
    print_status "Navigating to frontend-next directory..."
    cd frontend-next
fi

# Check if we're in the right directory now
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root or frontend-next directory"
    exit 1
fi

print_status "Current directory: $(pwd)"

# Step 1: Git Pull
print_status "Step 1: Pulling latest changes from Git..."
if git pull origin main; then
    print_success "Git pull completed successfully"
else
    print_error "Git pull failed"
    exit 1
fi

# Step 2: Install Dependencies
print_status "Step 2: Installing npm dependencies..."
if npm install; then
    print_success "npm install completed successfully"
else
    print_error "npm install failed"
    exit 1
fi

# Step 3: Stop PM2 Process
print_status "Step 3: Stopping PM2 process 'tusgal-app'..."
if pm2 stop tusgal-app; then
    print_success "PM2 process stopped successfully"
else
    print_warning "PM2 process 'tusgal-app' not found or already stopped"
fi

# Step 4: Build the Application
print_status "Step 4: Building the application with increased memory limit..."
export NODE_OPTIONS="--max-old-space-size=768"
if npm run build; then
    print_success "Build completed successfully"
else
    print_error "Build failed"
    exit 1
fi

# Step 5: Start/Restart PM2 Process
print_status "Step 5: Starting PM2 process 'tusgal-app'..."
if pm2 start npm --name "tusgal-app" -- start; then
    print_success "PM2 process started successfully"
else
    print_error "Failed to start PM2 process"
    exit 1
fi

# Step 6: Show PM2 Status
print_status "Step 6: Checking PM2 status..."
pm2 status

# Step 7: Show recent logs
print_status "Step 7: Recent PM2 logs for tusgal-app:"
pm2 logs tusgal-app --lines 10

print_success "🎉 Deployment completed successfully!"
print_status "Your application should now be running with the latest changes"
print_status "Check the logs above for any errors or issues"

# Optional: Save PM2 configuration
print_status "Saving PM2 configuration..."
pm2 save

echo ""
echo "📋 Deployment Summary:"
echo "✅ Git pull completed"
echo "✅ Dependencies installed"
echo "✅ PM2 process stopped"
echo "✅ Application built"
echo "✅ PM2 process restarted"
echo "✅ Configuration saved"
echo ""
echo "🌐 Your app should be accessible at your configured domain/port"
echo "📊 Monitor with: pm2 monit"
echo "📝 View logs with: pm2 logs tusgal-app"
