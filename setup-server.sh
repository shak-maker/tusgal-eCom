#!/bin/bash

# Initial server setup script for Tusgal Next.js application
# This script should be run ONCE on a fresh server to prepare it for deployment

set -e

# Configuration - Update these values for your server
SERVER_HOSTNAME="tusgal-server"  # Replace with your desired hostname
TIMEZONE="UTC"  # Replace with your timezone (e.g., "America/New_York")
ADMIN_EMAIL="admin@yourdomain.com"  # Replace with your email

echo "🔧 Starting initial server setup..."

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

# Check if running as root
check_root() {
    if [ "$EUID" -ne 0 ]; then
        print_error "This script must be run as root (use sudo)"
        exit 1
    fi
}

# Update system and set hostname
setup_system() {
    print_step "Setting up system..."
    
    # Update system
    print_status "Updating system packages..."
    apt update && apt upgrade -y
    
    # Set hostname
    print_status "Setting hostname to: $SERVER_HOSTNAME"
    hostnamectl set-hostname $SERVER_HOSTNAME
    
    # Set timezone
    print_status "Setting timezone to: $TIMEZONE"
    timedatectl set-timezone $TIMEZONE
    
    # Install essential packages
    print_status "Installing essential packages..."
    apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release
    
    print_status "System setup completed!"
}

# Create non-root user
create_user() {
    print_step "Creating non-root user..."
    
    # Check if user already exists
    if id "tusgal" &>/dev/null; then
        print_warning "User 'tusgal' already exists"
    else
        print_status "Creating user 'tusgal'..."
        useradd -m -s /bin/bash tusgal
        usermod -aG sudo tusgal
        
        # Set up SSH key directory
        mkdir -p /home/tusgal/.ssh
        chmod 700 /home/tusgal/.ssh
        
        print_status "User 'tusgal' created successfully!"
        print_warning "Please set a password for user 'tusgal':"
        passwd tusgal
    fi
}

# Configure SSH
configure_ssh() {
    print_step "Configuring SSH..."
    
    # Backup original SSH config
    cp /etc/ssh/sshd_config /etc/ssh/sshd_config.backup
    
    # Configure SSH for security
    cat > /etc/ssh/sshd_config << EOF
# SSH Configuration for Tusgal Server
Port 22
Protocol 2
HostKey /etc/ssh/ssh_host_rsa_key
HostKey /etc/ssh/ssh_host_ecdsa_key
HostKey /etc/ssh/ssh_host_ed25519_key

# Authentication
PermitRootLogin no
PubkeyAuthentication yes
PasswordAuthentication yes
PermitEmptyPasswords no
ChallengeResponseAuthentication no
UsePAM yes

# Security
X11Forwarding no
PrintMotd no
PrintLastLog yes
TCPKeepAlive yes
ClientAliveInterval 300
ClientAliveCountMax 2

# Logging
SyslogFacility AUTH
LogLevel INFO

# Allow specific users
AllowUsers tusgal root

# Restrict access
MaxAuthTries 3
MaxSessions 10
EOF

    # Restart SSH service
    systemctl restart ssh
    systemctl enable ssh
    
    print_status "SSH configured securely!"
    print_warning "Root login has been disabled. Use user 'tusgal' for SSH access."
}

# Install and configure firewall
setup_firewall() {
    print_step "Setting up firewall..."
    
    # Install UFW if not present
    if ! command_exists ufw; then
        apt install -y ufw
    fi
    
    # Configure firewall
    ufw --force reset
    ufw default deny incoming
    ufw default allow outgoing
    ufw allow 22/tcp
    ufw allow 80/tcp
    ufw allow 443/tcp
    ufw --force enable
    
    print_status "Firewall configured and enabled!"
}

# Install Node.js
install_nodejs() {
    print_step "Installing Node.js..."
    
    if ! command_exists node; then
        # Add NodeSource repository
        curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
        apt-get install -y nodejs
        
        # Install global packages
        npm install -g pm2 npm@latest
        
        print_status "Node.js installed successfully!"
    else
        print_status "Node.js already installed: $(node --version)"
    fi
}

# Install PostgreSQL
install_postgresql() {
    print_step "Installing PostgreSQL..."
    
    if ! command_exists psql; then
        apt install -y postgresql postgresql-contrib
        
        # Start and enable PostgreSQL
        systemctl start postgresql
        systemctl enable postgresql
        
        print_status "PostgreSQL installed and started!"
    else
        print_status "PostgreSQL already installed"
    fi
}

# Install Nginx
install_nginx() {
    print_step "Installing Nginx..."
    
    if ! command_exists nginx; then
        apt install -y nginx
        
        # Start and enable Nginx
        systemctl start nginx
        systemctl enable nginx
        
        print_status "Nginx installed and started!"
    else
        print_status "Nginx already installed"
    fi
}

# Install monitoring tools
install_monitoring() {
    print_step "Installing monitoring tools..."
    
    # Install htop for system monitoring
    apt install -y htop iotop nethogs
    
    # Install logrotate for log management
    apt install -y logrotate
    
    print_status "Monitoring tools installed!"
}

# Set up log rotation
setup_log_rotation() {
    print_step "Setting up log rotation..."
    
    # Create log rotation configuration for the application
    cat > /etc/logrotate.d/tusgal-app << EOF
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

    print_status "Log rotation configured!"
}

# Create application directories
create_directories() {
    print_step "Creating application directories..."
    
    # Create application directory
    mkdir -p /var/www/tusgal-app
    mkdir -p /var/www/backups
    
    # Set ownership
    chown -R tusgal:tusgal /var/www/tusgal-app
    chown -R tusgal:tusgal /var/www/backups
    
    # Set permissions
    chmod -R 755 /var/www/tusgal-app
    chmod -R 755 /var/www/backups
    
    print_status "Application directories created!"
}

# Set up automatic updates
setup_automatic_updates() {
    print_step "Setting up automatic security updates..."
    
    apt install -y unattended-upgrades
    
    # Configure automatic updates
    cat > /etc/apt/apt.conf.d/50unattended-upgrades << EOF
Unattended-Upgrade::Allowed-Origins {
    "\${distro_id}:\${distro_codename}-security";
    "\${distro_id}ESMApps:\${distro_codename}-apps-security";
    "\${distro_id}ESM:\${distro_codename}-infra-security";
};

Unattended-Upgrade::Package-Blacklist {
};

Unattended-Upgrade::DevRelease "false";
Unattended-Upgrade::Remove-Unused-Dependencies "true";
Unattended-Upgrade::Automatic-Reboot "false";
Unattended-Upgrade::Automatic-Reboot-Time "02:00";
EOF

    # Enable automatic updates
    cat > /etc/apt/apt.conf.d/20auto-upgrades << EOF
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Download-Upgradeable-Packages "1";
APT::Periodic::AutocleanInterval "7";
APT::Periodic::Unattended-Upgrade "1";
EOF

    print_status "Automatic security updates configured!"
}

# Create setup completion script
create_completion_script() {
    print_step "Creating setup completion script..."
    
    cat > /home/tusgal/setup-complete.sh << 'EOF'
#!/bin/bash

echo "🎉 Server setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Upload your application files using: ./upload-to-server.sh"
echo "2. SSH into the server as user 'tusgal': ssh tusgal@your-server-ip"
echo "3. Navigate to the app directory: cd /var/www/tusgal-app"
echo "4. Run the deployment script: ./deploy.sh"
echo ""
echo "Important security notes:"
echo "- Root SSH access has been disabled"
echo "- Firewall is configured and enabled"
echo "- Automatic security updates are enabled"
echo "- Use user 'tusgal' for all operations"
echo ""
echo "Server information:"
echo "- Hostname: $(hostname)"
echo "- Timezone: $(timedatectl show --property=Timezone --value)"
echo "- Node.js: $(node --version)"
echo "- PostgreSQL: $(psql --version | cut -d' ' -f3)"
echo "- Nginx: $(nginx -v 2>&1 | cut -d' ' -f3)"
EOF

    chmod +x /home/tusgal/setup-complete.sh
    chown tusgal:tusgal /home/tusgal/setup-complete.sh
    
    print_status "Setup completion script created!"
}

# Main setup function
main() {
    echo "Starting initial server setup..."
    echo "Server Hostname: $SERVER_HOSTNAME"
    echo "Timezone: $TIMEZONE"
    echo "Admin Email: $ADMIN_EMAIL"
    echo ""
    
    check_root
    setup_system
    create_user
    configure_ssh
    setup_firewall
    install_nodejs
    install_postgresql
    install_nginx
    install_monitoring
    setup_log_rotation
    create_directories
    setup_automatic_updates
    create_completion_script
    
    echo ""
    print_status "Initial server setup completed successfully!"
    echo ""
    print_status "Server is now ready for application deployment!"
    print_status "Run the completion script as user 'tusgal' for next steps:"
    print_status "sudo -u tusgal /home/tusgal/setup-complete.sh"
    echo ""
    print_warning "Important:"
    print_warning "1. Root SSH access has been disabled"
    print_warning "2. Use user 'tusgal' for SSH access"
    print_warning "3. Firewall is configured and enabled"
    print_warning "4. Automatic security updates are enabled"
    echo ""
    print_status "You can now proceed with uploading and deploying your application!"
}

# Run main function
main "$@"
