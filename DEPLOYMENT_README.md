# Tusgal Next.js Application Deployment Guide

This directory contains all the scripts and configuration files needed to deploy the Tusgal Next.js application to a production server.

## 📁 Scripts Overview

### Core Deployment Scripts

| Script | Purpose | When to Use |
|--------|---------|-------------|
| `setup-server.sh` | Initial server setup and configuration | **Once** on a fresh server |
| `upload-to-server.sh` | Upload application files to server | Before each deployment |
| `deploy.sh` | Deploy and configure the application | After uploading files |
| `manage-deployment.sh` | Manage running application | Daily operations |

### Configuration Files

| File | Purpose |
|------|---------|
| `env.template` | Environment variables template |
| `deployment-steps.md` | Detailed manual deployment guide |

## 🚀 Quick Start Deployment

### Prerequisites
- A fresh Ubuntu 20.04+ server
- SSH access to your server
- Domain name (optional but recommended)

### Step 1: Initial Server Setup
```bash
# Upload setup script to server
scp setup-server.sh root@your-server-ip:/root/

# SSH into server and run setup
ssh root@your-server-ip
chmod +x setup-server.sh
./setup-server.sh
```

### Step 2: Upload Application
```bash
# From your local project directory
chmod +x upload-to-server.sh
./upload-to-server.sh
```

### Step 3: Deploy Application
```bash
# SSH into server as tusgal user
ssh tusgal@your-server-ip

# Navigate to app directory and deploy
cd /var/www/tusgal-app
chmod +x deploy.sh
./deploy.sh
```

## 📋 Detailed Script Descriptions

### 1. `setup-server.sh` - Initial Server Setup

**Purpose**: Prepares a fresh server for application deployment.

**What it does**:
- Updates system packages
- Creates non-root user (`tusgal`)
- Configures SSH security
- Installs Node.js, PostgreSQL, Nginx
- Sets up firewall
- Configures automatic updates
- Creates application directories

**Usage**:
```bash
# Run as root on fresh server
sudo ./setup-server.sh
```

**Configuration**:
Edit the script to customize:
- `SERVER_HOSTNAME`: Server hostname
- `TIMEZONE`: Server timezone
- `ADMIN_EMAIL`: Admin email for notifications

### 2. `upload-to-server.sh` - File Upload

**Purpose**: Uploads application files to the server.

**What it does**:
- Checks prerequisites (rsync, SSH)
- Tests SSH connection
- Creates backup of existing deployment
- Uploads files using rsync
- Sets proper permissions

**Usage**:
```bash
# Run from project root directory
./upload-to-server.sh
```

**Configuration**:
Edit the script to customize:
- `SERVER_IP`: Your server IP address
- `SERVER_USER`: SSH username (default: `tusgal`)
- `APP_DIR`: Application directory on server
- `SSH_KEY_PATH`: Path to SSH key (optional)

### 3. `deploy.sh` - Application Deployment

**Purpose**: Deploys and configures the application on the server.

**What it does**:
- Installs dependencies
- Sets up environment variables
- Configures database
- Builds the application
- Sets up PM2 process manager
- Configures Nginx
- Sets up firewall

**Usage**:
```bash
# Run on server in app directory
cd /var/www/tusgal-app
./deploy.sh
```

**Configuration**:
Edit the script to customize:
- `APP_NAME`: Application name
- `DOMAIN_NAME`: Your domain name
- `DB_NAME`: Database name
- `DB_USER`: Database user
- `DB_PASSWORD`: Database password

### 4. `manage-deployment.sh` - Application Management

**Purpose**: Provides common operations for managing the deployed application.

**Commands**:
```bash
# Show application status
./manage-deployment.sh status

# Restart application
./manage-deployment.sh restart

# Update from Git repository
./manage-deployment.sh update

# View logs
./manage-deployment.sh logs

# Monitor application
./manage-deployment.sh monitor

# Create backup
./manage-deployment.sh backup

# Restore from backup
./manage-deployment.sh restore /path/to/backup.tar.gz

# Health check
./manage-deployment.sh health
```

## 🔧 Configuration

### Environment Variables

1. Copy the template:
```bash
cp env.template .env
```

2. Update with your actual values:
```env
# Database
DATABASE_URL="postgresql://tusgal_user:your_password@localhost:5432/tusgal_db"

# Supabase (if using)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key

# Email
RESEND_API_KEY=your_resend_key

# Next.js
NEXTAUTH_SECRET=your_generated_secret
NEXTAUTH_URL=https://your-domain.com
```

### Server Configuration

Update these values in the scripts:

**In `upload-to-server.sh`**:
```bash
SERVER_IP="your-server-ip"
SERVER_USER="tusgal"
APP_DIR="/var/www/tusgal-app"
```

**In `deploy.sh`**:
```bash
DOMAIN_NAME="your-domain.com"
DB_PASSWORD="your_secure_password"
```

## 🔒 Security Considerations

### SSH Security
- Root login is disabled after setup
- Use SSH keys for authentication
- Firewall is configured to allow only necessary ports

### Application Security
- Environment variables are properly configured
- Database user has minimal required privileges
- Nginx includes security headers
- Automatic security updates are enabled

### Backup Strategy
- Daily database backups
- Weekly application backups
- Backups are compressed and rotated

## 📊 Monitoring and Maintenance

### Daily Operations
```bash
# Check application status
./manage-deployment.sh status

# Monitor logs
./manage-deployment.sh logs

# Health check
./manage-deployment.sh health
```

### Weekly Operations
```bash
# Create backup
./manage-deployment.sh backup

# Update application (if using Git)
./manage-deployment.sh update

# Check system resources
htop
df -h
```

### Monthly Operations
- Review and rotate logs
- Update system packages
- Review security settings
- Test backup restoration

## 🚨 Troubleshooting

### Common Issues

**Application won't start**:
```bash
# Check PM2 status
pm2 status

# Check logs
pm2 logs tusgal-app

# Restart application
./manage-deployment.sh restart
```

**Database connection issues**:
```bash
# Test database connection
psql -h localhost -U tusgal_user -d tusgal_db

# Check PostgreSQL status
sudo systemctl status postgresql
```

**Nginx issues**:
```bash
# Check Nginx status
sudo systemctl status nginx

# Test configuration
sudo nginx -t

# Check logs
sudo tail -f /var/log/nginx/error.log
```

### Getting Help

1. Check the logs:
```bash
./manage-deployment.sh logs
```

2. Run health check:
```bash
./manage-deployment.sh health
```

3. Review the detailed deployment guide:
```bash
cat deployment-steps.md
```

## 📝 Best Practices

### Before Deployment
1. Test your application locally
2. Update all dependencies
3. Review environment variables
4. Create a backup of current deployment

### During Deployment
1. Monitor the deployment process
2. Check logs for any errors
3. Verify all services are running
4. Test the application functionality

### After Deployment
1. Run health checks
2. Monitor application performance
3. Set up monitoring and alerting
4. Document any custom configurations

### Security
1. Use strong passwords
2. Regularly update dependencies
3. Monitor logs for suspicious activity
4. Keep backups secure
5. Use HTTPS in production

## 🔄 Update Process

### For Code Updates
```bash
# 1. Upload new code
./upload-to-server.sh

# 2. Deploy updates
cd /var/www/tusgal-app
./deploy.sh
```

### For Git-based Updates
```bash
# On server
cd /var/www/tusgal-app
./manage-deployment.sh update
```

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review the logs using `./manage-deployment.sh logs`
3. Run health checks using `./manage-deployment.sh health`
4. Consult the detailed deployment guide in `deployment-steps.md`

## 📄 License

These deployment scripts are provided as-is for the Tusgal Next.js application. Make sure to review and customize them according to your specific requirements and security policies.
