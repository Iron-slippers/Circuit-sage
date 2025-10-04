# CircuitSage Deployment Guide

This guide provides step-by-step instructions for deploying the CircuitSage application using Docker on both Windows and Linux systems.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Windows Deployment](#windows-deployment)
- [Linux Deployment](#linux-deployment)
- [Production Deployment](#production-deployment)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software
- **Docker**: Version 20.10 or higher
- **Docker Compose**: Version 2.0 or higher (included with Docker Desktop)
- **Git**: For cloning the repository

### System Requirements
- **RAM**: Minimum 2GB, Recommended 4GB
- **Disk Space**: Minimum 2GB free space
- **Network**: Internet connection for pulling Docker images

---

## Environment Setup

### 1. Create Environment File

Create a `.env` file in the `CircuitSage` directory with the following variables:

```bash
# Database Configuration
POSTGRES_USER=circuitsage
POSTGRES_PASSWORD=your_secure_password_here
POSTGRES_DB=circuitsage

# Database URL (format: postgresql://user:password@host:port/database)
DATABASE_URL=postgresql://circuitsage:your_secure_password_here@db:5432/circuitsage

# Application Port
PORT=5000

# Node Environment
NODE_ENV=production
```

**Security Note**: Replace `your_secure_password_here` with a strong, unique password.

---

## Windows Deployment

### Installation

#### 1. Install Docker Desktop for Windows

1. Download Docker Desktop from: https://www.docker.com/products/docker-desktop
2. Run the installer and follow the installation wizard
3. Restart your computer if prompted
4. Launch Docker Desktop
5. Verify installation by opening PowerShell and running:
   ```powershell
   docker --version
   docker-compose --version
   ```

#### 2. Clone the Repository

Open PowerShell or Command Prompt:

```powershell
# Navigate to your desired directory
cd C:\Projects

# Clone the repository
git clone <repository-url>
cd CircuitSage
```

#### 3. Create Environment File

Using PowerShell:

```powershell
# Create .env file
New-Item -Path .env -ItemType File

# Edit with notepad
notepad .env
```

Copy the environment variables from the [Environment Setup](#environment-setup) section above.

#### 4. Build and Run

Using PowerShell or Command Prompt:

```powershell
# Build the Docker images
docker-compose build

# Start the application
docker-compose up -d

# View logs
docker-compose logs -f
```

#### 5. Access the Application

Open your browser and navigate to:
- **Application**: http://localhost:5000
- **API Health Check**: http://localhost:5000/api/formulas

### Stopping the Application (Windows)

```powershell
# Stop containers
docker-compose down

# Stop and remove volumes (WARNING: This deletes database data)
docker-compose down -v
```

### Updating the Application (Windows)

```powershell
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose build
docker-compose up -d
```

---

## Linux Deployment

### Installation

#### 1. Install Docker and Docker Compose

For **Ubuntu/Debian**:

```bash
# Update package index
sudo apt-get update

# Install prerequisites
sudo apt-get install -y ca-certificates curl gnupg lsb-release

# Add Docker's official GPG key
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Set up the repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Start and enable Docker
sudo systemctl start docker
sudo systemctl enable docker

# Add your user to docker group (optional, to run docker without sudo)
sudo usermod -aG docker $USER

# Log out and log back in for group changes to take effect
```

For **CentOS/RHEL/Fedora**:

```bash
# Install Docker
sudo yum install -y yum-utils
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
sudo yum install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Start and enable Docker
sudo systemctl start docker
sudo systemctl enable docker

# Add your user to docker group
sudo usermod -aG docker $USER
```

Verify installation:

```bash
docker --version
docker compose version
```

#### 2. Clone the Repository

```bash
# Navigate to your desired directory
cd ~

# Clone the repository
git clone <repository-url>
cd CircuitSage
```

#### 3. Create Environment File

```bash
# Create .env file
nano .env
```

Copy the environment variables from the [Environment Setup](#environment-setup) section above.

Save and exit (Ctrl+X, then Y, then Enter in nano).

#### 4. Build and Run

```bash
# Build the Docker images
docker compose build

# Start the application in detached mode
docker compose up -d

# View logs
docker compose logs -f
```

#### 5. Access the Application

Open your browser and navigate to:
- **Application**: http://localhost:5000 or http://your-server-ip:5000
- **API Health Check**: http://localhost:5000/api/formulas

### Stopping the Application (Linux)

```bash
# Stop containers
docker compose down

# Stop and remove volumes (WARNING: This deletes database data)
docker compose down -v
```

### Updating the Application (Linux)

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker compose down
docker compose build
docker compose up -d
```

---

## Production Deployment

### Security Best Practices

1. **Use Strong Passwords**: Generate secure passwords for database credentials
   ```bash
   # Generate a random password (Linux/macOS)
   openssl rand -base64 32
   ```

2. **Enable Firewall**: Only expose necessary ports
   ```bash
   # Ubuntu/Debian with UFW
   sudo ufw allow 5000/tcp
   sudo ufw enable
   
   # CentOS/RHEL with firewalld
   sudo firewall-cmd --permanent --add-port=5000/tcp
   sudo firewall-cmd --reload
   ```

3. **Use HTTPS**: Set up a reverse proxy (Nginx/Caddy) with SSL/TLS
4. **Regular Updates**: Keep Docker and system packages updated
5. **Backup Database**: Regularly backup PostgreSQL data

### Reverse Proxy with Nginx (Optional)

Install Nginx:

```bash
# Ubuntu/Debian
sudo apt-get install nginx

# CentOS/RHEL
sudo yum install nginx
```

Create Nginx configuration (`/etc/nginx/sites-available/circuitsage`):

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the configuration:

```bash
sudo ln -s /etc/nginx/sites-available/circuitsage /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### SSL/TLS with Certbot (Let's Encrypt)

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal is configured automatically
```

### Database Backup

Create a backup script (`backup.sh`):

```bash
#!/bin/bash
BACKUP_DIR="/backup/circuitsage"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
CONTAINER_NAME="circuitsage-db-1"

mkdir -p $BACKUP_DIR

docker exec $CONTAINER_NAME pg_dump -U circuitsage circuitsage > \
  "$BACKUP_DIR/backup_$TIMESTAMP.sql"

# Keep only last 7 days of backups
find $BACKUP_DIR -type f -mtime +7 -delete

echo "Backup completed: backup_$TIMESTAMP.sql"
```

Make it executable and schedule with cron:

```bash
chmod +x backup.sh

# Add to crontab (daily at 2 AM)
crontab -e
# Add: 0 2 * * * /path/to/backup.sh
```

---

## Troubleshooting

### Common Issues

#### 1. Port Already in Use

**Error**: `Bind for 0.0.0.0:5000 failed: port is already allocated`

**Solution**:
```bash
# Find process using port 5000
# Windows (PowerShell)
netstat -ano | findstr :5000

# Linux
sudo lsof -i :5000

# Kill the process or change the port in .env and docker-compose.yml
```

#### 2. Database Connection Failed

**Error**: `Error: connect ECONNREFUSED`

**Solution**:
```bash
# Check if database container is running
docker compose ps

# View database logs
docker compose logs db

# Restart database
docker compose restart db
```

#### 3. Permission Denied (Linux)

**Error**: `permission denied while trying to connect to Docker daemon`

**Solution**:
```bash
# Add user to docker group
sudo usermod -aG docker $USER

# Log out and log back in, or run:
newgrp docker
```

#### 4. Out of Memory

**Error**: Build fails or containers crash

**Solution**:
```bash
# Increase Docker memory limit in Docker Desktop settings
# Or on Linux, check available memory:
free -h

# Clean up Docker resources:
docker system prune -a
```

#### 5. Build Fails

**Solution**:
```bash
# Clean rebuild
docker compose down
docker system prune -a
docker compose build --no-cache
docker compose up -d
```

### Viewing Logs

```bash
# All containers
docker compose logs -f

# Specific container
docker compose logs -f app
docker compose logs -f db

# Last 100 lines
docker compose logs --tail=100 app
```

### Accessing Container Shell

```bash
# Application container
docker compose exec app sh

# Database container
docker compose exec db psql -U circuitsage -d circuitsage
```

### Health Check

```bash
# Check application health
curl http://localhost:5000/api/formulas

# Check Docker container health
docker compose ps
```

---

## Additional Commands

### Docker Compose Commands Reference

```bash
# Start services
docker compose up -d

# Stop services
docker compose down

# View running containers
docker compose ps

# View logs
docker compose logs -f

# Restart service
docker compose restart app

# Rebuild specific service
docker compose build app

# Scale service (if applicable)
docker compose up -d --scale app=3

# Remove all containers and volumes
docker compose down -v
```

### Monitoring Resources

```bash
# View resource usage
docker stats

# View disk usage
docker system df
```

---

## Support

For issues and questions:
- Check the troubleshooting section above
- Review Docker logs: `docker compose logs -f`
- Ensure all environment variables are correctly set
- Verify Docker and Docker Compose versions are up to date

---

**Last Updated**: 2025
