# Deployment Guide for Tusgal Next.js Application

## Prerequisites
- SSH access to your DigitalOcean server (157.230.252.228)
- Domain name (optional but recommended)
- Environment variables ready

## Step 1: Connect to Server
```bash
ssh root@157.230.252.228
```

## Step 2: Update System and Install Dependencies
```bash
# Update system
sudo apt update && sudo apt upgrade -y

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
```

## Step 3: Set Up Database
```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE tusgal_db;
CREATE USER tusgal_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE tusgal_db TO tusgal_user;
\q
```

## Step 4: Create Application Directory
```bash
sudo mkdir -p /var/www/tusgal-app
sudo chown $USER:$USER /var/www/tusgal-app
cd /var/www/tusgal-app
```

## Step 5: Upload Your Application
You have several options:

### Option A: Using SCP (from your local machine)
```bash
# From your local machine, in the project directory
scp -r frontend-next/* root@157.230.252.228:/var/www/tusgal-app/
```

### Option B: Using Git (if your code is in a repository)
```bash
# On the server
git clone your-repository-url .
```

### Option C: Using rsync
```bash
# From your local machine
rsync -avz --exclude 'node_modules' --exclude '.git' frontend-next/ root@157.230.252.228:/var/www/tusgal-app/
```

## Step 6: Install Dependencies and Build
```bash
cd /var/www/tusgal-app
npm install
npm run build
```

## Step 7: Set Up Environment Variables
```bash
nano .env
```

Add your environment variables:
```env
# Database
DATABASE_URL="postgresql://tusgal_user:your_secure_password@localhost:5432/tusgal_db"
DIRECT_URL="postgresql://tusgal_user:your_secure_password@localhost:5432/tusgal_db"

# Supabase (if using)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Resend (for email)
RESEND_API_KEY=your_resend_api_key

# Next.js
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=https://your-domain.com
```

## Step 8: Set Up Database Schema
```bash
npx prisma generate
npx prisma db push
```

## Step 9: Configure PM2
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
    }
  }]
}
EOF

# Start the application
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## Step 10: Configure Nginx
```bash
# Create Nginx configuration
sudo tee /etc/nginx/sites-available/tusgal-app << 'EOF'
server {
    listen 80;
    server_name your-domain.com www.your-domain.com 157.230.252.228;

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
    }
}
EOF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/tusgal-app /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

## Step 11: Set Up Firewall
```bash
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable
```

## Step 12: Set Up SSL (Optional but Recommended)
```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

## Step 13: Verify Deployment
```bash
# Check if the application is running
pm2 status
pm2 logs tusgal-app

# Check Nginx status
sudo systemctl status nginx

# Test the application
curl http://localhost:3000
```

## Troubleshooting

### Check PM2 logs
```bash
pm2 logs tusgal-app
```

### Restart the application
```bash
pm2 restart tusgal-app
```

### Check Nginx logs
```bash
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### Check database connection
```bash
npx prisma db pull
```

## Important Notes
1. Replace `your-domain.com` with your actual domain
2. Replace `your_secure_password` with a strong password
3. Update all environment variables with your actual values
4. Make sure your domain DNS points to your server IP (157.230.252.228)
5. Consider setting up automatic backups for your database
6. Monitor your application logs regularly
