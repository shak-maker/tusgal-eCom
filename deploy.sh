#!/bin/bash

# Deployment script for Next.js application
set -e

# Configuration - Update these values for your deployment
APP_NAME="tusgal-app"
APP_DIR="/var/www/tusgal-app"
DOMAIN_NAME="your-domain.com"  # Replace with your actual domain
DB_NAME="tusgal_db"
DB_USER="tusgal_user"
DB_PASSWORD="your_secure_password"  # Replace with a strong password

echo "🚀 Starting deployment for $APP_NAME..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Function to check if we're in the right directory
check_app_directory() {
    if [ ! -d "$APP_DIR" ]; then
        print_error "Application directory $APP_DIR not found!"
        print_error "Please make sure you've uploaded the application files first."
        exit 1
    fi
    
    if [ ! -f "$APP_DIR/package.json" ]; then
        print_error "package.json not found in $APP_DIR"
        print_error "Please make sure you're in the correct application directory."
        exit 1
    fi
    
    print_status "Application directory check passed!"
}

# Update system packages
update_system() {
    print_step "Updating system packages..."
    sudo apt update && sudo apt upgrade -y
    print_status "System packages updated!"
}

# Install Node.js and npm
install_nodejs() {
    if ! command_exists node; then
        print_step "Installing Node.js..."
        curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
        sudo apt-get install -y nodejs
        print_status "Node.js installed successfully!"
    else
        print_status "Node.js already installed: $(node --version)"
    fi
}

# Install PM2 for process management
install_pm2() {
    if ! command_exists pm2; then
        print_step "Installing PM2..."
        sudo npm install -g pm2
        print_status "PM2 installed successfully!"
    else
        print_status "PM2 already installed: $(pm2 --version)"
    fi
}

# Install PostgreSQL
install_postgresql() {
    if ! command_exists psql; then
        print_step "Installing PostgreSQL..."
        sudo apt install -y postgresql postgresql-contrib
        sudo systemctl start postgresql
        sudo systemctl enable postgresql
        print_status "PostgreSQL installed and started!"
    else
        print_status "PostgreSQL already installed"
    fi
}

# Set up database
setup_database() {
    print_step "Setting up database..."
    
    # Create database and user
    sudo -u postgres psql -c "CREATE DATABASE $DB_NAME;" 2>/dev/null || print_warning "Database $DB_NAME already exists"
    sudo -u postgres psql -c "CREATE USER $DB_USER WITH ENCRYPTED PASSWORD '$DB_PASSWORD';" 2>/dev/null || print_warning "User $DB_USER already exists"
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;" 2>/dev/null || print_warning "Privileges already granted"
    
    print_status "Database setup completed!"
}

# Navigate to app directory and install dependencies
setup_application() {
    print_step "Setting up application..."
    
    cd $APP_DIR
    
    # Install dependencies
    print_status "Installing dependencies..."
    npm install
    
    print_status "Application setup completed!"
}

# Set up environment variables
setup_environment() {
    print_step "Setting up environment variables..."
    
    cd $APP_DIR
    
    if [ ! -f .env ]; then
        cat > .env << EOF
# Database Configuration
DATABASE_URL="postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME"
DIRECT_URL="postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME"

# Supabase Configuration (if using)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Email Configuration (Resend)
RESEND_API_KEY=your_resend_api_key

# Next.js Configuration
NEXTAUTH_SECRET=$(openssl rand -base64 32)
NEXTAUTH_URL=https://$DOMAIN_NAME

# Application Configuration
NODE_ENV=production
PORT=3000
EOF
        print_warning "Created .env file with default values. Please update with your actual credentials!"
    else
        print_status ".env file already exists"
    fi
}

# Set up database schema
setup_database_schema() {
    print_step "Setting up database schema..."
    
    cd $APP_DIR
    
    # Generate Prisma client
    npx prisma generate
    
    # Push database schema
    npx prisma db push
    
    print_status "Database schema setup completed!"
}

# Build the application
build_application() {
    print_step "Building the application..."
    
    cd $APP_DIR
    
    # Build the application
    npm run build
    
    print_status "Application built successfully!"
}

# Set up PM2 ecosystem file
setup_pm2() {
    print_step "Setting up PM2 configuration..."
    
    cd $APP_DIR
    
    cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: '$APP_NAME',
    script: 'npm',
    args: 'start',
    cwd: '$APP_DIR',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
}
EOF

    # Create logs directory
    mkdir -p logs
    
    print_status "PM2 configuration created!"
}

# Start the application with PM2
start_application() {
    print_step "Starting application with PM2..."
    
    cd $APP_DIR
    
    # Stop existing process if running
    pm2 stop $APP_NAME 2>/dev/null || true
    pm2 delete $APP_NAME 2>/dev/null || true
    
    # Start the application
    pm2 start ecosystem.config.js
    pm2 save
    pm2 startup
    
    print_status "Application started with PM2!"
}

# Set up Nginx
setup_nginx() {
    print_step "Setting up Nginx..."
    
    # Install Nginx if not already installed
    if ! command_exists nginx; then
        sudo apt install -y nginx
    fi
    
    # Create Nginx configuration
    sudo tee /etc/nginx/sites-available/$APP_NAME << EOF
server {
    listen 80;
    server_name $DOMAIN_NAME www.$DOMAIN_NAME;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 86400;
    }

    # Static files caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

    # Enable the site
    sudo ln -sf /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/
    sudo rm -f /etc/nginx/sites-enabled/default
    
    # Test Nginx configuration
    sudo nginx -t
    
    # Restart Nginx
    sudo systemctl restart nginx
    sudo systemctl enable nginx
    
    print_status "Nginx configured and started!"
}

# Set up firewall
setup_firewall() {
    print_step "Setting up firewall..."
    
    sudo ufw allow 22
    sudo ufw allow 80
    sudo ufw allow 443
    sudo ufw --force enable
    
    print_status "Firewall configured!"
}

# Main deployment function
main() {
    echo "Starting deployment for $APP_NAME..."
    echo "App Directory: $APP_DIR"
    echo "Domain: $DOMAIN_NAME"
    echo ""
    
    check_app_directory
    update_system
    install_nodejs
    install_pm2
    install_postgresql
    setup_database
    setup_application
    setup_environment
    setup_database_schema
    build_application
    setup_pm2
    start_application
    setup_nginx
    setup_firewall
    
    echo ""
    print_status "Deployment completed successfully!"
    print_status "Your application should be running at: http://$DOMAIN_NAME"
    echo ""
    print_warning "Important next steps:"
    print_warning "1. Update the .env file with your actual credentials"
    print_warning "2. Replace '$DOMAIN_NAME' with your actual domain"
    print_warning "3. Set up SSL certificate with Let's Encrypt"
    print_warning "4. Configure your domain DNS to point to this server"
    print_warning "5. Test your application thoroughly"
    echo ""
    print_status "Useful commands:"
    print_status "- Check app status: pm2 status"
    print_status "- View logs: pm2 logs $APP_NAME"
    print_status "- Restart app: pm2 restart $APP_NAME"
    print_status "- Check Nginx: sudo systemctl status nginx"
}

# Run main function
main "$@"
