#!/bin/bash

# Upload script for Tusgal Next.js application
# Configuration - Update these values for your server
SERVER_IP="157.230.252.228"
SERVER_USER="root"
APP_DIR="/var/www/tusgal-app"
SSH_KEY_PATH=""  # Leave empty to use default SSH key, or specify path like "~/.ssh/id_rsa"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
check_prerequisites() {
    print_step "Checking prerequisites..."
    
    if ! command_exists rsync; then
        print_error "rsync is not installed. Please install it first."
        exit 1
    fi
    
    if ! command_exists ssh; then
        print_error "SSH is not available. Please install OpenSSH client."
        exit 1
    fi
    
    # Check if we're in the right directory
    if [ ! -d "frontend-next" ]; then
        print_error "frontend-next directory not found. Make sure you're in the project root."
        exit 1
    fi
    
    print_status "Prerequisites check passed!"
}

# Test SSH connection
test_ssh_connection() {
    print_step "Testing SSH connection to server..."
    
    local ssh_cmd="ssh"
    if [ -n "$SSH_KEY_PATH" ]; then
        ssh_cmd="ssh -i $SSH_KEY_PATH"
    fi
    
    if ! $ssh_cmd -o ConnectTimeout=10 -o BatchMode=yes $SERVER_USER@$SERVER_IP "echo 'SSH connection successful'" >/dev/null 2>&1; then
        print_error "Cannot connect to server. Please check:"
        print_error "1. Server IP: $SERVER_IP"
        print_error "2. Username: $SERVER_USER"
        print_error "3. SSH key or password authentication"
        print_error "4. Server is running and accessible"
        exit 1
    fi
    
    print_status "SSH connection successful!"
}

# Create backup of current deployment
create_backup() {
    print_step "Creating backup of current deployment..."
    
    local ssh_cmd="ssh"
    if [ -n "$SSH_KEY_PATH" ]; then
        ssh_cmd="ssh -i $SSH_KEY_PATH"
    fi
    
    if $ssh_cmd $SERVER_USER@$SERVER_IP "[ -d $APP_DIR ]" 2>/dev/null; then
        local backup_dir="/var/www/backups/tusgal-app-$(date +%Y%m%d-%H%M%S)"
        $ssh_cmd $SERVER_USER@$SERVER_IP "sudo mkdir -p /var/www/backups && sudo cp -r $APP_DIR $backup_dir"
        print_status "Backup created at: $backup_dir"
    else
        print_warning "No existing deployment found. Skipping backup."
    fi
}

# Upload application files
upload_files() {
    print_step "Uploading application files to server..."
    
    # Create a temporary directory for upload
    TEMP_DIR=$(mktemp -d)
    print_status "Created temporary directory: $TEMP_DIR"
    
    # Copy application files
    print_status "Copying application files..."
    cp -r frontend-next/* $TEMP_DIR/
    
    # Remove unnecessary files to reduce upload size
    cd $TEMP_DIR
    print_status "Cleaning up unnecessary files..."
    rm -rf node_modules .next .git .env.local .env.production
    
    # Calculate upload size
    UPLOAD_SIZE=$(du -sh . | cut -f1)
    print_status "Upload size: $UPLOAD_SIZE"
    
    # Upload files using rsync
    local rsync_cmd="rsync -avz --progress --delete"
    if [ -n "$SSH_KEY_PATH" ]; then
        rsync_cmd="rsync -avz --progress --delete -e 'ssh -i $SSH_KEY_PATH'"
    fi
    
    print_status "Starting file upload..."
    if eval $rsync_cmd ./ $SERVER_USER@$SERVER_IP:$APP_DIR/; then
        print_status "File upload completed successfully!"
    else
        print_error "File upload failed!"
        rm -rf $TEMP_DIR
        exit 1
    fi
    
    # Clean up temporary directory
    rm -rf $TEMP_DIR
    print_status "Temporary directory cleaned up"
}

# Set proper permissions
set_permissions() {
    print_step "Setting proper file permissions..."
    
    local ssh_cmd="ssh"
    if [ -n "$SSH_KEY_PATH" ]; then
        ssh_cmd="ssh -i $SSH_KEY_PATH"
    fi
    
    $ssh_cmd $SERVER_USER@$SERVER_IP "sudo chown -R $SERVER_USER:$SERVER_USER $APP_DIR && sudo chmod -R 755 $APP_DIR"
    print_status "Permissions set successfully!"
}

# Main execution
main() {
    echo "🚀 Starting application upload to server..."
    echo "Server: $SERVER_USER@$SERVER_IP"
    echo "App Directory: $APP_DIR"
    echo ""
    
    check_prerequisites
    test_ssh_connection
    create_backup
    upload_files
    set_permissions
    
    echo ""
    print_status "Upload completed successfully!"
    echo ""
    print_status "Next steps:"
    print_status "1. SSH into your server: ssh $SERVER_USER@$SERVER_IP"
    print_status "2. Navigate to the app directory: cd $APP_DIR"
    print_status "3. Run the deployment script: ./deploy.sh"
    print_status "4. Or follow the manual steps in deployment-steps.md"
    print_status "5. Set up your environment variables"
    print_status "6. Install dependencies and build the application"
    echo ""
    print_warning "Don't forget to update your .env file with production values!"
}

# Run main function
main "$@"
