# Deployment Guide for Tusgal Next.js Application

## Overview
This guide provides step-by-step instructions for deploying the Tusgal Next.js application to a production server. The deployment process includes server setup, application deployment, and post-deployment configuration.

## Prerequisites
- A fresh Ubuntu 20.04+ server (DigitalOcean, AWS, etc.)
- SSH access to your server
- Domain name (optional but recommended for SSL)
- Environment variables ready

## Quick Start (Automated Deployment)

### Step 1: Initial Server Setup
```bash
# On your local machine, upload the setup script
scp setup-server.sh root@157.230.252.228:/root/

# SSH into your server
ssh root@157.230.252.228

# Run the initial setup script (run as root)
chmod +x setup-server.sh
./setup-server.sh
```

### Step 2: Upload Application
```bash
# On your local machine, in the project root
chmod +x upload-to-server.sh
./upload-to-server.sh
```

### Step 3: Deploy Application
```bash
# SSH into your server as the tusgal user
ssh tusgal@157.230.252.228

# Navigate to the app directory
cd /var/www/tusgal-app

# Run the deployment script
chmod +x deploy.sh
./deploy.sh
```

## Manual Deployment Steps

### Phase 1: Server Preparation

#### 1.1 Connect to Server
```bash
ssh root@157.230.252.228
```

#### 1.2 Update System and Install Dependencies
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install essential packages
sudo apt install -y curl wget git unzip software-properties-common

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Install Nginx
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Install UFW firewall
sudo apt install -y ufw
```

#### 1.3 Create Non-Root User (Security Best Practice)
```bash
# Create user
sudo useradd -m -s /bin/bash tusgal
sudo usermod -aG sudo tusgal

# Set password
sudo passwd tusgal

# Set up SSH key directory
sudo mkdir -p /home/tusgal/.ssh
sudo chmod 700 /home/tusgal/.ssh
```

#### 1.4 Configure Firewall
```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
```

### Phase 2: Database Setup

#### 2.1 Configure PostgreSQL
```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE tusgal_db;
CREATE USER tusgal_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE tusgal_db TO tusgal_user;
ALTER USER tusgal_user CREATEDB;
\q
```

#### 2.2 Test Database Connection
```bash
# Test connection
psql -h localhost -U tusgal_user -d tusgal_db -W
```

### Phase 3: Application Deployment

#### 3.1 Create Application Directory
```bash
sudo mkdir -p /var/www/tusgal-app
sudo chown tusgal:tusgal /var/www/tusgal-app
cd /var/www/tusgal-app
```

#### 3.2 Upload Application Files
Choose one of the following methods:

**Method A: Using SCP (from your local machine)**
```bash
# From your local machine, in the project directory
scp -r frontend-next/* tusgal@157.230.252.228:/var/www/tusgal-app/
```

**Method B: Using Git (if your code is in a repository)**
```bash
# On the server
git clone your-repository-url .
```

**Method C: Using rsync (recommended)**
```bash
# From your local machine
rsync -avz --exclude 'node_modules' --exclude '.git' --exclude '.next' frontend-next/ tusgal@157.230.252.228:/var/www/tusgal-app/
```

#### 3.3 Install Dependencies and Build
```bash
cd /var/www/tusgal-app

# Install dependencies
npm install

# Build the application
npm run build
```

#### 3.4 Set Up Environment Variables
```bash
nano .env
```

Add your environment variables:
```env
# Database Configuration
DATABASE_URL="postgresql://tusgal_user:your_secure_password@localhost:5432/tusgal_db"
DIRECT_URL="postgresql://tusgal_user:your_secure_password@localhost:5432/tusgal_db"

# Supabase Configuration (if using)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Email Configuration (Resend)
RESEND_API_KEY=your_resend_api_key

# Next.js Configuration
NEXTAUTH_SECRET=your_generated_secret
NEXTAUTH_URL=http://157.230.252.228

# Application Configuration
NODE_ENV=production
PORT=3000
```

#### 3.5 Set Up Database Schema
```bash
# Generate Prisma client
npx prisma generate

# Push database schema
npx prisma db push

# Seed database (if needed)
npm run db:seed
```

### Phase 4: Process Management

#### 4.1 Configure PM2
```bash
# Create PM2 ecosystem file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'tusgal-app',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/tusgal-app',
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

# Start the application
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Phase 5: Web Server Configuration

#### 5.1 Configure Nginx
```bash
# Create Nginx configuration
sudo tee /etc/nginx/sites-available/tusgal-app << 'EOF'
server {
    listen 80;
    server_name 157.230.252.228;

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
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
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
sudo ln -sf /etc/nginx/sites-available/tusgal-app /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### Phase 6: SSL Configuration (Optional but Recommended)

#### 6.1 Install Certbot
```bash
sudo apt install -y certbot python3-certbot-nginx
```

#### 6.2 Get SSL Certificate
```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

#### 6.3 Set Up Auto-Renewal
```bash
# Test auto-renewal
sudo certbot renew --dry-run

# Add to crontab for automatic renewal
echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -
```

## Post-Deployment Configuration

### 1. Set Up Monitoring
```bash
# Install monitoring tools
sudo apt install -y htop iotop nethogs

# Monitor application logs
pm2 logs tusgal-app

# Monitor system resources
htop
```

### 2. Set Up Log Rotation
```bash
# Create log rotation configuration
sudo tee /etc/logrotate.d/tusgal-app << 'EOF'
/var/www/tusgal-app/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 tusgal tusgal
    postrotate
        pm2 reloadLogs
    endscript
}
EOF
```

### 3. Set Up Automatic Updates
```bash
# Install unattended-upgrades
sudo apt install -y unattended-upgrades

# Configure automatic updates
sudo dpkg-reconfigure -plow unattended-upgrades
```

## Troubleshooting

### Common Issues and Solutions

#### 1. Application Won't Start
```bash
# Check PM2 status
pm2 status

# Check logs
pm2 logs tusgal-app

# Check if port is in use
sudo netstat -tlnp | grep :3000

# Restart application
pm2 restart tusgal-app
```

#### 2. Database Connection Issues
```bash
# Test database connection
psql -h localhost -U tusgal_user -d tusgal_db -W

# Check PostgreSQL status
sudo systemctl status postgresql

# Check PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-*.log
```

#### 3. Nginx Issues
```bash
# Check Nginx status
sudo systemctl status nginx

# Check Nginx configuration
sudo nginx -t

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# Restart Nginx
sudo systemctl restart nginx
```

#### 4. Permission Issues
```bash
# Fix file permissions
sudo chown -R tusgal:tusgal /var/www/tusgal-app
sudo chmod -R 755 /var/www/tusgal-app
```

#### 5. Memory Issues
```bash
# Check memory usage
free -h

# Check disk space
df -h

# Check process memory usage
pm2 monit
```

### Performance Optimization

#### 1. Enable Nginx Caching
```bash
# Add to Nginx configuration
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
    access_log off;
}
```

#### 2. Optimize PM2 Configuration
```bash
# Update PM2 ecosystem for better performance
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'tusgal-app',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/tusgal-app',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024',
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
}
EOF
```

## Security Considerations

### 1. Firewall Configuration
```bash
# Only allow necessary ports
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw deny 22/tcp from any to any port 22
```

### 2. SSH Security
```bash
# Disable root login
sudo nano /etc/ssh/sshd_config
# Set PermitRootLogin no

# Restart SSH
sudo systemctl restart ssh
```

### 3. Regular Security Updates
```bash
# Set up automatic security updates
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

## Backup Strategy

### 1. Database Backups
```bash
# Create backup script
cat > /home/tusgal/backup-db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/www/backups/database"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR
pg_dump -h localhost -U tusgal_user -d tusgal_db > $BACKUP_DIR/tusgal_db_$DATE.sql
gzip $BACKUP_DIR/tusgal_db_$DATE.sql
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete
EOF

chmod +x /home/tusgal/backup-db.sh

# Add to crontab for daily backups
echo "0 2 * * * /home/tusgal/backup-db.sh" | crontab -
```

### 2. Application Backups
```bash
# Create application backup script
cat > /home/tusgal/backup-app.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/www/backups/application"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR
tar -czf $BACKUP_DIR/tusgal-app_$DATE.tar.gz -C /var/www tusgal-app
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
EOF

chmod +x /home/tusgal/backup-app.sh

# Add to crontab for weekly backups
echo "0 3 * * 0 /home/tusgal/backup-app.sh" | crontab -
```

## Maintenance Commands

### Useful Commands for Day-to-Day Operations
```bash
# Check application status
pm2 status
pm2 logs tusgal-app

# Restart application
pm2 restart tusgal-app

# Update application
cd /var/www/tusgal-app
git pull
npm install
npm run build
pm2 restart tusgal-app

# Check system resources
htop
df -h
free -h

# Check service status
sudo systemctl status nginx
sudo systemctl status postgresql
sudo systemctl status ssh

# View logs
sudo journalctl -u nginx -f
sudo journalctl -u postgresql -f
```

## Important Notes
1. Replace `your-domain.com` with your actual domain
2. Replace `your_secure_password` with a strong password
3. Update all environment variables with your actual values
4. Make sure your domain DNS points to your server IP (157.230.252.228)
5. Consider setting up monitoring and alerting
6. Regularly update your application and system packages
7. Monitor your application logs for errors
8. Set up regular backups for your database and application
9. Test your deployment thoroughly before going live
10. Consider using a CDN for static assets in production

