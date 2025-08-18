#!/bin/bash

# Deployment script for Next.js application
set -e

echo "🚀 Starting deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

# Check if we're on the server
if [ "$(hostname)" != "your-server-hostname" ]; then
    print_status "Local environment detected. This script should be run on the server."
    exit 1
fi

# Update system packages
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js and npm if not already installed
if ! command -v node &> /dev/null; then
    print_status "Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Install PM2 for process management
if ! command -v pm2 &> /dev/null; then
    print_status "Installing PM2..."
    sudo npm install -g pm2
fi

# Install PostgreSQL if not already installed
if ! command -v psql &> /dev/null; then
    print_status "Installing PostgreSQL..."
    sudo apt install -y postgresql postgresql-contrib
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
fi

# Create application directory
APP_DIR="/var/www/tusgal-app"
print_status "Setting up application directory: $APP_DIR"
sudo mkdir -p $APP_DIR
sudo chown $USER:$USER $APP_DIR

# Navigate to app directory
cd $APP_DIR

# Copy application files (assuming you'll upload them)
print_status "Copying application files..."
# This assumes you'll upload the files or clone from git
# For now, we'll create a placeholder

# Install dependencies
print_status "Installing dependencies..."
npm install

# Set up environment variables
print_status "Setting up environment variables..."
if [ ! -f .env ]; then
    cat > .env << EOF
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/tusgal_db"
DIRECT_URL="postgresql://username:password@localhost:5432/tusgal_db"

# Supabase (if using)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Resend (for email)
RESEND_API_KEY=your_resend_api_key

# Next.js
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=https://your-domain.com
EOF
    print_warning "Please update the .env file with your actual credentials"
fi

# Set up database
print_status "Setting up database..."
npx prisma generate
npx prisma db push

# Build the application
print_status "Building the application..."
npm run build

# Set up PM2 ecosystem file
print_status "Setting up PM2 configuration..."
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'tusgal-app',
    script: 'npm',
    args: 'start',
    cwd: '$APP_DIR',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
EOF

# Start the application with PM2
print_status "Starting application with PM2..."
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Set up Nginx (if not already configured)
print_status "Setting up Nginx..."
sudo apt install -y nginx

# Create Nginx configuration
sudo tee /etc/nginx/sites-available/tusgal-app << EOF
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

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
    }
}
EOF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/tusgal-app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Set up firewall
print_status "Setting up firewall..."
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable

print_status "Deployment completed successfully!"
print_status "Your application should be running at: http://your-domain.com"
print_warning "Don't forget to:"
print_warning "1. Update the .env file with your actual credentials"
print_warning "2. Replace 'your-domain.com' with your actual domain"
print_warning "3. Set up SSL certificate with Let's Encrypt"
print_warning "4. Configure your domain DNS to point to this server"
