# Complete Study Group Platform Setup

All-in-one Docker Compose file that runs database, dbadmin, server, and client with automatic admin account creation.

## 🚀 One Command Setup

```bash
docker compose -f docker-compose.complete.yml up -d
```

That's it! This single command starts:
- **PostgreSQL Database** (port 5432)
- **pgAdmin** (port 5050)
- **Node.js API Server** (port 3000)
- **React Client** (port 5173)
- **Default Admin Account** (auto-created)

## 🌐 Access URLs

| Service | URL | Credentials |
|---------|-----|-------------|
| **Frontend App** | http://localhost:5173 | - |
| **API Server** | http://localhost:3000 | - |
| **API Health** | http://localhost:3000/api/health | - |
| **pgAdmin** | http://localhost:5050 | admin@studygroup.com / admin123 |
| **Database** | localhost:5432 | postgres / postgres |

### Default Admin Account
- **Email**: `admin@studygroup.com`
- **Password**: `admin123`
- **Role**: `ADMIN`

## 📋 What Happens on Startup

### 1. Database Initialization (30s)
- PostgreSQL starts and becomes healthy
- Database `study_group_platform` is created

### 2. pgAdmin Setup (10s)
- pgAdmin web interface starts
- Connects to the database automatically

### 3. Server Setup (60s)
- TypeScript configuration is created
- Database migrations run automatically
- **Default admin account is created**
- Sample data is seeded
- Development server starts with hot reload

### 4. Client Setup (30s)
- React development server starts
- Hot reload enabled for code changes
- Connects to API server automatically

## 🧪 Testing the Setup

### Health Checks
```bash
# API Health
curl http://localhost:3000/api/health

# Frontend (should return HTML)
curl http://localhost:5173

# Database connection
docker compose -f docker-compose.complete.yml exec db pg_isready -U postgres
```

### Admin Login Test
```bash
# Login with admin account
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@studygroup.com","password":"admin123"}'

# Should return JWT token
```

### Using the Token
```bash
# Save token from login response
TOKEN="your_jwt_token_here"

# Get users (admin only)
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/users
```

## 🛠️ Management Commands

### View Logs
```bash
# All services
docker compose -f docker-compose.complete.yml logs -f

# Specific service
docker compose -f docker-compose.complete.yml logs -f server
docker compose -f docker-compose.complete.yml logs -f client
docker compose -f docker-compose.complete.yml logs -f db
docker compose -f docker-compose.complete.yml logs -f dbadmin
```

### Service Control
```bash
# Restart specific service
docker compose -f docker-compose.complete.yml restart server

# Stop all services
docker compose -f docker-compose.complete.yml down

# Stop and remove all data (⚠️ deletes database)
docker compose -f docker-compose.complete.yml down -v

# Restart everything
docker compose -f docker-compose.complete.yml restart
```

### Check Status
```bash
docker compose -f docker-compose.complete.yml ps
```

## 🔧 Development Workflow

### Code Changes
Both server and client run in development mode with hot reload:

**Server Changes**:
- Edit files in `./server/src/`
- Server automatically restarts on changes
- View logs: `docker compose -f docker-compose.complete.yml logs -f server`

**Client Changes**:
- Edit files in `./client/src/`
- Browser automatically refreshes on changes
- View logs: `docker compose -f docker-compose.complete.yml logs -f client`

### Database Operations
```bash
# Run new migrations
docker compose -f docker-compose.complete.yml exec server npx prisma migrate dev

# Seed more data
docker compose -f docker-compose.complete.yml exec server npx prisma db seed

# Open Prisma Studio
docker compose -f docker-compose.complete.yml exec server npx prisma studio

# Direct database access
docker compose -f docker-compose.complete.yml exec db psql -U postgres -d study_group_platform
```

### User Management
```bash
# Create additional users
docker compose -f docker-compose.complete.yml exec server node create-admin.js

# Check existing users
docker compose -f docker-compose.complete.yml exec server node -e "
const { PrismaClient } = require('@prisma/client');
(async () => {
  const prisma = new PrismaClient();
  const users = await prisma.user.findMany();
  console.log('Users:', users);
  await prisma.\$disconnect();
})();
"
```

## 🔄 Rebuild After Changes

### Server Changes
```bash
docker compose -f docker-compose.complete.yml build server
docker compose -f docker-compose.complete.yml restart server
```

### Client Changes
```bash
docker compose -f docker-compose.complete.yml build client
docker compose -f docker-compose.complete.yml restart client
```

### Full Rebuild
```bash
docker compose -f docker-compose.complete.yml build --no-cache
docker compose -f docker-compose.complete.yml up -d
```

## 📊 Environment Customization

### Custom Configuration
Create a `.env.complete` file:

```env
# Database
POSTGRES_PASSWORD=your_secure_password

# Admin Account
DEFAULT_ADMIN_EMAIL=admin@yourdomain.com
DEFAULT_ADMIN_PASSWORD=secure_password
DEFAULT_ADMIN_NAME=Your Admin Name

# JWT Secrets
JWT_SECRET=your-super-secure-jwt-secret
JWT_REFRESH_SECRET=your-super-secure-refresh-secret

# API Configuration
ALLOWED_ORIGINS=http://localhost:5173,https://yourdomain.com
```

Use with:
```bash
docker compose -f docker-compose.complete.yml --env-file .env.complete up -d
```

### Port Customization
Edit the compose file to change ports:
```yaml
ports:
  - "8080:5173"  # Client on port 8080
  - "8000:3000"  # Server on port 8000
  - "5433:5432"  # Database on port 5433
  - "8050:80"    # pgAdmin on port 8050
```

## 🚨 Troubleshooting

### Services Won't Start
```bash
# Check logs for errors
docker compose -f docker-compose.complete.yml logs

# Common issues:
# - Port conflicts: Change port mappings
# - Build failures: Run with --no-cache
# - Permission issues: Check file ownership
```

### Database Issues
```bash
# Check database health
docker compose -f docker-compose.complete.yml exec db pg_isready -U postgres

# Reset database (⚠️ deletes all data)
docker compose -f docker-compose.complete.yml down -v
docker compose -f docker-compose.complete.yml up -d
```

### Server Issues
```bash
# Check server health
curl http://localhost:3000/api/health

# Check TypeScript compilation
docker compose -f docker-compose.complete.yml exec server npm run build

# Reset server container
docker compose -f docker-compose.complete.yml restart server
```

### Client Issues
```bash
# Check Vite dev server
curl http://localhost:5173

# Check build process
docker compose -f docker-compose.complete.yml exec client npm run build

# Reset client container
docker compose -f docker-compose.complete.yml restart client
```

### Clean Reset
```bash
# Nuclear option - reset everything
docker compose -f docker-compose.complete.yml down -v
docker system prune -a
docker compose -f docker-compose.complete.yml up -d --build
```

## 🔒 Security Notes

### Development vs Production
This setup is optimized for **development**. For production:
- Change all default passwords
- Use secure JWT secrets
- Configure proper CORS origins
- Enable HTTPS
- Use production Dockerfiles
- Set up proper logging

### Default Credentials
⚠️ **Important**: Change these in production:
- Admin: `admin@studygroup.com` / `admin123`
- Database: `postgres` / `postgres`
- pgAdmin: `admin@studygroup.com` / `admin123`

## 📦 Data Persistence

All data is persisted in Docker volumes:
- **Database**: `complete_db_data`
- **pgAdmin**: `complete_pgadmin_data`
- **Server uploads**: `complete_server_uploads`

Data survives container restarts and rebuilds.
Data is only deleted with `docker compose down -v`.

## 🎯 Quick Reference

**Start everything:**
```bash
docker compose -f docker-compose.complete.yml up -d
```

**View all logs:**
```bash
docker compose -f docker-compose.complete.yml logs -f
```

**Stop everything:**
```bash
docker compose -f docker-compose.complete.yml down
```

**Reset everything:**
```bash
docker compose -f docker-compose.complete.yml down -v && \
docker compose -f docker-compose.complete.yml up -d
```