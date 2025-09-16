# Study Group Platform - Production Deployment

Production-ready containerized deployment of the Study Group Platform with PostgreSQL database, Node.js API, and React frontend.

## 📋 Prerequisites

- Docker & Docker Compose
- Domain name (for SSL/HTTPS)
- Reverse proxy/load balancer (nginx, Traefik, etc.)
- SSL certificates

## 🚀 Quick Production Deployment

### 1. Clone and Setup
```bash
git clone <repository-url>
cd study-group-platform
```

### 2. Configure Environment
```bash
# Copy production environment template
cp .env.production .env.prod

# Edit configuration for your environment
nano .env.prod
```

**Critical settings to change:**
- `POSTGRES_PASSWORD` - Secure database password
- `JWT_SECRET` - JWT signing secret (32+ characters)
- `JWT_REFRESH_SECRET` - Refresh token secret (32+ characters)
- `DEFAULT_ADMIN_PASSWORD` - Admin account password
- `API_BASE_URL` - Your domain URL
- `ALLOWED_ORIGINS` - Your frontend domain(s)

### 3. Deploy
```bash
# Run automated deployment
./deploy-production.sh
```

### 4. Access Application
- **Frontend**: http://localhost:3001
- **API**: http://localhost:3000
- **Admin Login**: Use credentials from `.env.prod`

## 🔧 Manual Deployment Steps

### Step 1: Environment Configuration
```bash
# Required environment variables
export POSTGRES_PASSWORD=your_secure_password
export JWT_SECRET=your_jwt_secret_32_chars_minimum
export JWT_REFRESH_SECRET=your_refresh_secret_32_chars_minimum
export DEFAULT_ADMIN_PASSWORD=your_admin_password
export API_BASE_URL=https://api.yourdomain.com
export ALLOWED_ORIGINS=https://yourdomain.com
```

### Step 2: Build and Start
```bash
# Build production images
docker compose -f docker-compose.prod.yml build --no-cache

# Start all services
docker compose -f docker-compose.prod.yml up -d
```

### Step 3: Initialize Database
```bash
# Wait for database to be ready
docker compose -f docker-compose.prod.yml exec database pg_isready -U postgres

# Apply database schema
docker compose -f docker-compose.prod.yml exec server npx prisma migrate deploy

# Seed initial data
docker compose -f docker-compose.prod.yml exec server npx prisma db seed
```

## 🏥 Health Checks

### Automated Health Checks
All services include health checks:
- **Database**: PostgreSQL ready check
- **Server**: `/api/health` endpoint
- **Client**: nginx `/health` endpoint

### Manual Health Verification
```bash
# Check all service status
docker compose -f docker-compose.prod.yml ps

# Test API health
curl http://localhost:3000/api/health

# Test client health
curl http://localhost:3001/health

# Test admin login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@yourdomain.com","password":"your_password"}'
```

## 🔒 Security Configuration

### Environment Security
- **Never commit `.env.prod`** - Add to `.gitignore`
- **Use strong passwords** - Minimum 16 characters
- **Rotate JWT secrets** - Change periodically
- **Secure database** - Use strong PostgreSQL password

### CORS Configuration
Update `ALLOWED_ORIGINS` in `.env.prod`:
```bash
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### SSL/HTTPS Setup
Use a reverse proxy (nginx/Traefik) for SSL termination:

**nginx example:**
```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # Frontend
    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 📊 Monitoring & Maintenance

### Service Management
```bash
# View logs
docker compose -f docker-compose.prod.yml logs -f

# Restart services
docker compose -f docker-compose.prod.yml restart

# Stop services
docker compose -f docker-compose.prod.yml down

# Update and redeploy
git pull
docker compose -f docker-compose.prod.yml build --no-cache
docker compose -f docker-compose.prod.yml up -d
```

### Database Management
```bash
# Backup database
docker compose -f docker-compose.prod.yml exec database pg_dump -U postgres study_group_platform > backup.sql

# Restore database
cat backup.sql | docker compose -f docker-compose.prod.yml exec -T database psql -U postgres -d study_group_platform

# Database migrations
docker compose -f docker-compose.prod.yml exec server npx prisma migrate deploy
```

### Application Updates
```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker compose -f docker-compose.prod.yml build --no-cache
docker compose -f docker-compose.prod.yml up -d

# Apply any new migrations
docker compose -f docker-compose.prod.yml exec server npx prisma migrate deploy
```

## 🔥 Troubleshooting

### Common Issues

**Database Connection Failed**
```bash
# Check database status
docker compose -f docker-compose.prod.yml logs database

# Verify network connectivity
docker compose -f docker-compose.prod.yml exec server nc -z database 5432
```

**Server Won't Start**
```bash
# Check server logs
docker compose -f docker-compose.prod.yml logs server

# Verify environment variables
docker compose -f docker-compose.prod.yml exec server env | grep -E "(DATABASE_URL|JWT_)"
```

**Client Build Failed**
```bash
# Check client logs
docker compose -f docker-compose.prod.yml logs client

# Rebuild client only
docker compose -f docker-compose.prod.yml build --no-cache client
docker compose -f docker-compose.prod.yml up -d client
```

**Health Checks Failing**
```bash
# Check service health
curl -i http://localhost:3000/api/health
curl -i http://localhost:3001/health

# Manual health check inside container
docker compose -f docker-compose.prod.yml exec server node healthcheck.js
```

### Performance Tuning

**Database Performance**
```bash
# Increase shared_buffers for better performance
docker compose -f docker-compose.prod.yml exec database psql -U postgres -c "ALTER SYSTEM SET shared_buffers = '256MB';"
docker compose -f docker-compose.prod.yml restart database
```

**Resource Limits**
Add to docker-compose.prod.yml:
```yaml
deploy:
  resources:
    limits:
      memory: 512M
      cpus: '0.5'
    reservations:
      memory: 256M
```

## 🌐 Production Architecture

```
[Internet] → [Load Balancer/SSL] → [Docker Network]
                                       ├── Client (nginx:3001)
                                       ├── Server (node:3000)
                                       └── Database (postgres:5432)
```

### Recommended Production Stack
- **Reverse Proxy**: nginx or Traefik
- **SSL**: Let's Encrypt or commercial certificate
- **Monitoring**: Prometheus + Grafana
- **Logging**: ELK stack or similar
- **Backup**: Automated database backups
- **Container Orchestration**: Docker Swarm or Kubernetes

## 📝 Environment Variables Reference

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `POSTGRES_PASSWORD` | Database password | - | ✅ |
| `JWT_SECRET` | JWT signing secret | - | ✅ |
| `JWT_REFRESH_SECRET` | Refresh token secret | - | ✅ |
| `DEFAULT_ADMIN_PASSWORD` | Admin account password | - | ✅ |
| `API_BASE_URL` | Backend API URL | `http://localhost:3000` | ✅ |
| `ALLOWED_ORIGINS` | CORS allowed origins | `http://localhost:3001` | ✅ |
| `DATABASE_PORT` | Database port mapping | `5432` | ❌ |
| `API_PORT` | API port mapping | `3000` | ❌ |
| `CLIENT_PORT` | Client port mapping | `3001` | ❌ |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | - | ❌ |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret | - | ❌ |

## 📈 Scaling Considerations

### Horizontal Scaling
- Use container orchestration (Kubernetes, Docker Swarm)
- Implement load balancing across multiple instances
- Use external PostgreSQL service (AWS RDS, Google Cloud SQL)
- Implement Redis for session storage

### Vertical Scaling
- Increase container resource limits
- Optimize database configuration
- Use database connection pooling
- Implement caching strategies

---

**Last Updated**: September 16, 2025
**Version**: 1.2.0
**Deployment Status**: Production Ready ✅