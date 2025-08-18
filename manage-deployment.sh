#!/bin/bash

# Deployment Management Script for Tusgal Next.js Application
# This script provides common operations for managing your deployed application

set -e

# Configuration
APP_NAME="tusgal-app"
APP_DIR="/var/www/tusgal-app"
SERVER_IP="157.230.252.228"
SERVER_USER="tusgal"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

# Function to check if we're on the server
check_server() {
    if [ ! -d "$APP_DIR" ]; then
        print_error "This script must be run on the server where the application is deployed."
        print_error "Expected app directory: $APP_DIR"
        exit 1
    fi
}

# Show application status
show_status() {
    print_step "Application Status"
    echo "=================="
    
    # PM2 status
    print_status "PM2 Status:"
    pm2 status
    
    echo ""
    
    # System resources
    print_status "System Resources:"
    echo "Memory: $(free -h | grep Mem | awk '{print $3 "/" $2}')"
    echo "Disk: $(df -h / | tail -1 | awk '{print $3 "/" $2}')"
    echo "CPU Load: $(uptime | awk -F'load average:' '{print $2}')"
    
    echo ""
    
    # Service status
    print_status "Service Status:"
    echo "Nginx: $(systemctl is-active nginx)"
    echo "PostgreSQL: $(systemctl is-active postgresql)"
    echo "SSH: $(systemctl is-active ssh)"
}

# Restart application
restart_app() {
    print_step "Restarting Application"
    
    cd $APP_DIR
    
    # Restart PM2 process
    pm2 restart $APP_NAME
    
    print_status "Application restarted successfully!"
}

# Update application from Git
update_app() {
    print_step "Updating Application from Git"
    
    cd $APP_DIR
    
    # Check if this is a git repository
    if [ ! -d ".git" ]; then
        print_error "This is not a git repository. Cannot update from git."
        exit 1
    fi
    
    # Create backup before update
    print_status "Creating backup..."
    local backup_dir="/var/www/backups/$(date +%Y%m%d-%H%M%S)"
    sudo mkdir -p $backup_dir
    sudo cp -r . $backup_dir/
    print_status "Backup created at: $backup_dir"
    
    # Pull latest changes
    print_status "Pulling latest changes..."
    git pull origin main
    
    # Install dependencies
    print_status "Installing dependencies..."
    npm install
    
    # Build application
    print_status "Building application..."
    npm run build
    
    # Restart application
    print_status "Restarting application..."
    pm2 restart $APP_NAME
    
    print_status "Application updated successfully!"
}

# View logs
view_logs() {
    print_step "Application Logs"
    echo "=================="
    
    # Show PM2 logs
    pm2 logs $APP_NAME --lines 50
}

# Monitor application
monitor_app() {
    print_step "Real-time Application Monitoring"
    echo "==================================="
    
    # Start PM2 monitoring
    pm2 monit
}

# Create backup
create_backup() {
    print_step "Creating Application Backup"
    
    local backup_dir="/var/www/backups/$(date +%Y%m%d-%H%M%S)"
    sudo mkdir -p $backup_dir
    
    # Backup application files
    print_status "Backing up application files..."
    sudo cp -r $APP_DIR $backup_dir/
    
    # Backup database
    print_status "Backing up database..."
    pg_dump -h localhost -U tusgal_user -d tusgal_db > $backup_dir/database_backup.sql
    
    # Compress backup
    print_status "Compressing backup..."
    sudo tar -czf $backup_dir.tar.gz -C /var/www/backups $(basename $backup_dir)
    sudo rm -rf $backup_dir
    
    print_status "Backup created successfully: $backup_dir.tar.gz"
}

# Restore from backup
restore_backup() {
    local backup_file=$1
    
    if [ -z "$backup_file" ]; then
        print_error "Please specify a backup file to restore from."
        print_status "Usage: $0 restore <backup_file.tar.gz>"
        exit 1
    fi
    
    if [ ! -f "$backup_file" ]; then
        print_error "Backup file not found: $backup_file"
        exit 1
    fi
    
    print_step "Restoring from Backup"
    
    # Stop application
    print_status "Stopping application..."
    pm2 stop $APP_NAME
    
    # Create current backup before restore
    print_status "Creating current backup before restore..."
    create_backup
    
    # Extract backup
    local restore_dir="/tmp/restore_$(date +%Y%m%d-%H%M%S)"
    sudo mkdir -p $restore_dir
    sudo tar -xzf $backup_file -C $restore_dir
    
    # Find the extracted directory
    local extracted_dir=$(find $restore_dir -maxdepth 1 -type d | head -2 | tail -1)
    
    # Restore application files
    print_status "Restoring application files..."
    sudo rm -rf $APP_DIR/*
    sudo cp -r $extracted_dir/* $APP_DIR/
    sudo chown -R $SERVER_USER:$SERVER_USER $APP_DIR
    
    # Restore database if backup exists
    if [ -f "$extracted_dir/database_backup.sql" ]; then
        print_status "Restoring database..."
        psql -h localhost -U tusgal_user -d tusgal_db < $extracted_dir/database_backup.sql
    fi
    
    # Clean up
    sudo rm -rf $restore_dir
    
    # Restart application
    print_status "Restarting application..."
    cd $APP_DIR
    pm2 restart $APP_NAME
    
    print_status "Restore completed successfully!"
}

# Check application health
health_check() {
    print_step "Application Health Check"
    echo "=========================="
    
    # Check if application is running
    if pm2 list | grep -q $APP_NAME; then
        print_status "✓ Application is running"
    else
        print_error "✗ Application is not running"
        return 1
    fi
    
    # Check if application is responding
    if curl -s http://localhost:3000 > /dev/null; then
        print_status "✓ Application is responding"
    else
        print_error "✗ Application is not responding"
        return 1
    fi
    
    # Check database connection
    if psql -h localhost -U tusgal_user -d tusgal_db -c "SELECT 1;" > /dev/null 2>&1; then
        print_status "✓ Database connection is working"
    else
        print_error "✗ Database connection failed"
        return 1
    fi
    
    # Check Nginx
    if systemctl is-active nginx > /dev/null; then
        print_status "✓ Nginx is running"
    else
        print_error "✗ Nginx is not running"
        return 1
    fi
    
    print_status "All health checks passed!"
}

# Show usage
show_usage() {
    echo "Deployment Management Script for Tusgal Next.js Application"
    echo ""
    echo "Usage: $0 <command> [options]"
    echo ""
    echo "Commands:"
    echo "  status              Show application status and system resources"
    echo "  restart             Restart the application"
    echo "  update              Update application from Git repository"
    echo "  logs                View application logs"
    echo "  monitor             Start real-time monitoring"
    echo "  backup              Create a backup of application and database"
    echo "  restore <file>      Restore from backup file"
    echo "  health              Perform health check on application"
    echo "  help                Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 status"
    echo "  $0 restart"
    echo "  $0 update"
    echo "  $0 backup"
    echo "  $0 restore /var/www/backups/20231201-120000.tar.gz"
    echo ""
}

# Main function
main() {
    # Check if we're on the server
    check_server
    
    # Parse command
    case "${1:-help}" in
        status)
            show_status
            ;;
        restart)
            restart_app
            ;;
        update)
            update_app
            ;;
        logs)
            view_logs
            ;;
        monitor)
            monitor_app
            ;;
        backup)
            create_backup
            ;;
        restore)
            restore_backup "$2"
            ;;
        health)
            health_check
            ;;
        help|--help|-h)
            show_usage
            ;;
        *)
            print_error "Unknown command: $1"
            echo ""
            show_usage
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
