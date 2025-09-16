# Study Group Platform - Two-File Docker Setup

Complete setup using separate Docker Compose files for database and applications.

## 📋 Files Overview

- **`docker-compose.db.yml`** - Database services (PostgreSQL + pgAdmin)
- **`docker-compose.apps.yml`** - Application services (Server + Client)

## 🚀 Complete Setup Guide

### Step 1: Start Database Services
```bash
docker compose -f docker-compose.db.yml up -d
```
**What starts:**
- PostgreSQL Database (port 5432)
- pgAdmin Web Interface (port 5050)

**Wait for:** Database to become healthy (~30 seconds)
```bash
# Check database status
docker compose -f docker-compose.db.yml ps
# Should show "healthy" status for database
```

### Step 2: Start Application Services
```bash
docker compose -f docker-compose.apps.yml up -d
```
**What starts:**
- Node.js API Server (port 3000)
- React Frontend Client (port 5173)

### Step 3: Initialize Database
After both services are running, initialize the database:

#### 3a. Run Database Migrations
```bash
docker compose -f docker-compose.apps.yml exec server npx prisma migrate deploy
```

#### 3b. Seed Database with Admin Account
The database seeding automatically creates admin accounts:
```bash
docker compose -f docker-compose.apps.yml exec server npx prisma db seed
```

**This creates:**
- **admin@learning.com** / password (Admin role)
- **alice@example.com** / password123 (User role)
- Sample topics and sessions

#### 3c. Alternative: Manual Admin Creation
```bash
docker compose -f docker-compose.apps.yml exec server node -e "
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function createAdmin() {
  const prisma = new PrismaClient();
  try {
    const adminEmail = 'admin@studygroup.com';
    const adminPassword = 'admin123';
    const adminName = 'System Administrator';

    console.log('🔍 Checking for existing admin account...');
    const existing = await prisma.user.findUnique({
      where: { email: adminEmail }
    });

    if (existing) {
      console.log('✅ Admin account already exists:', adminEmail);
      console.log('   Role:', existing.role);
      console.log('   ID:', existing.id);
      return existing;
    }

    console.log('👤 Creating new admin account...');
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    const admin = await prisma.user.create({
      data: {
        name: adminName,
        email: adminEmail,
        passwordHash: hashedPassword,
        role: 'ADMIN',
        isProfileComplete: true
      }
    });

    console.log('✅ Admin account created successfully!');
    console.log('   Email:', admin.email);
    console.log('   Role:', admin.role);
    console.log('   ID:', admin.id);
    return admin;

  } catch (error) {
    console.error('❌ Error creating admin account:', error.message);
    throw error;
  } finally {
    await prisma.\$disconnect();
  }
}

createAdmin().then(() => process.exit(0)).catch(e => process.exit(1));
"
```


## 🌐 Access Your Application

| Service | URL | Credentials |
|---------|-----|-------------|
| **Frontend App** | http://localhost:5173 | - |
| **API Server** | http://localhost:3000 | - |
| **API Health Check** | http://localhost:3000/api/health | - |
| **pgAdmin** | http://localhost:5050 | admin@studygroup.com / admin123 |
| **Database** | localhost:5432 | postgres / postgres |

### Default Admin Login
After seeding:
- **Email**: `admin@learning.com`
- **Password**: `password`
- **Role**: `ADMIN`

Alternative user:
- **Email**: `alice@example.com`
- **Password**: `password123`
- **Role**: `USER`

## 🧪 Verify Setup

### Test API Health
```bash
curl http://localhost:3000/api/health
# Expected: {"status":"OK","timestamp":"...","service":"Study Group Platform API"}
```

### Test Admin Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@learning.com","password":"password"}'
# Expected: JWT token response
```

### Test Frontend
```bash
curl http://localhost:5173
# Expected: HTML response from React app
```

## 📊 Management Commands

### View Service Status
```bash
# Database services
docker compose -f docker-compose.db.yml ps

# Application services
docker compose -f docker-compose.apps.yml ps

# All services health
docker compose -f docker-compose.db.yml ps && echo "---" && docker compose -f docker-compose.apps.yml ps
```

### View Logs
```bash
# Database logs
docker compose -f docker-compose.db.yml logs -f

# Application logs
docker compose -f docker-compose.apps.yml logs -f

# Specific service logs
docker compose -f docker-compose.db.yml logs -f db
docker compose -f docker-compose.apps.yml logs -f server
docker compose -f docker-compose.apps.yml logs -f client
```

### Restart Services
```bash
# Restart applications (keep database running)
docker compose -f docker-compose.apps.yml restart

# Restart specific service
docker compose -f docker-compose.apps.yml restart server
docker compose -f docker-compose.apps.yml restart client

# Restart database services
docker compose -f docker-compose.db.yml restart
```

### Stop Services
```bash
# Stop applications (keep database)
docker compose -f docker-compose.apps.yml down

# Stop database services
docker compose -f docker-compose.db.yml down

# Stop everything
docker compose -f docker-compose.apps.yml down && docker compose -f docker-compose.db.yml down
```

## 🔧 Development Workflow

### Code Changes
Both server and client support hot reload:

**Server Changes** (`./server/src/`):
- TypeScript files auto-compile and restart server
- View logs: `docker compose -f docker-compose.apps.yml logs -f server`

**Client Changes** (`./client/src/`):
- React files auto-refresh browser
- View logs: `docker compose -f docker-compose.apps.yml logs -f client`

### Database Operations
```bash
# Create new migration
docker compose -f docker-compose.apps.yml exec server npx prisma migrate dev --name migration_name

# View database with Prisma Studio
docker compose -f docker-compose.apps.yml exec server npx prisma studio

# Direct database access
docker compose -f docker-compose.db.yml exec db psql -U postgres -d study_group_platform

# Check migration status
docker compose -f docker-compose.apps.yml exec server npx prisma migrate status
```

### User Management
```bash
# List all users
docker compose -f docker-compose.apps.yml exec server node -e "
const { PrismaClient } = require('@prisma/client');
(async () => {
  const prisma = new PrismaClient();
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, createdAt: true }
  });
  console.log('Users in database:');
  console.table(users);
  await prisma.\$disconnect();
})();
"

# Create additional admin user
docker compose -f docker-compose.apps.yml exec server node -e "
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
(async () => {
  const prisma = new PrismaClient();
  const hashedPassword = await bcrypt.hash('newpassword', 10);
  const user = await prisma.user.create({
    data: {
      name: 'New Admin',
      email: 'newadmin@example.com',
      passwordHash: hashedPassword,
      role: 'ADMIN',
      isProfileComplete: true
    }
  });
  console.log('Created user:', user.email);
  await prisma.\$disconnect();
})();
"
```

## 🔄 Rebuild After Changes

### Server Changes
```bash
docker compose -f docker-compose.apps.yml build server
docker compose -f docker-compose.apps.yml restart server
```

### Client Changes
```bash
docker compose -f docker-compose.apps.yml build client
docker compose -f docker-compose.apps.yml restart client
```

### Full Rebuild
```bash
docker compose -f docker-compose.apps.yml build --no-cache
docker compose -f docker-compose.apps.yml restart
```

## 🚨 Troubleshooting

### Database Won't Start
```bash
# Check database logs
docker compose -f docker-compose.db.yml logs db

# Check port conflicts
lsof -i :5432

# Reset database (⚠️ deletes all data)
docker compose -f docker-compose.db.yml down -v
docker compose -f docker-compose.db.yml up -d
```

### Applications Won't Start
```bash
# Check if database is running first
docker compose -f docker-compose.db.yml ps

# Check network connectivity
docker network ls | grep sgp_shared_network

# Check application logs
docker compose -f docker-compose.apps.yml logs server
docker compose -f docker-compose.apps.yml logs client
```

### Database Connection Issues
```bash
# Test connectivity from server
docker compose -f docker-compose.apps.yml exec server nc -z sgp_database 5432

# Check environment variables
docker compose -f docker-compose.apps.yml exec server env | grep DATABASE

# Verify network
docker compose -f docker-compose.apps.yml exec server ping sgp_database
```

### API Issues
```bash
# Check server health endpoint
curl http://localhost:3000/api/health

# Check if migrations ran
docker compose -f docker-compose.apps.yml exec server npx prisma migrate status

# Check database connection from server
docker compose -f docker-compose.apps.yml exec server npx prisma db push --accept-data-loss
```

## 🔄 Complete Reset

### Clean Restart (Keep Data)
```bash
# Stop everything
docker compose -f docker-compose.apps.yml down
docker compose -f docker-compose.db.yml down

# Start fresh
docker compose -f docker-compose.db.yml up -d
sleep 30  # Wait for database
docker compose -f docker-compose.apps.yml up -d

# Re-run setup
docker compose -f docker-compose.apps.yml exec server npx prisma migrate deploy
```

### Nuclear Reset (⚠️ Deletes All Data)
```bash
# Stop and remove everything
docker compose -f docker-compose.apps.yml down -v
docker compose -f docker-compose.db.yml down -v

# Remove shared network
docker network rm sgp_shared_network || true

# Start completely fresh
docker compose -f docker-compose.db.yml up -d
sleep 30
docker compose -f docker-compose.apps.yml up -d --build

# Run full setup
docker compose -f docker-compose.apps.yml exec server npx prisma migrate deploy
# ... (run admin creation script again)
```

## 💡 Quick Reference Commands

### Complete Setup from Scratch
```bash
# 1. Start database
docker compose -f docker-compose.db.yml up -d && sleep 30

# 2. Start applications
docker compose -f docker-compose.apps.yml up -d

# 3. Apply database schema and seed data
docker compose -f docker-compose.apps.yml exec server npx prisma db push
docker compose -f docker-compose.apps.yml exec server npx prisma db seed
```

### Daily Development
```bash
# Start everything
docker compose -f docker-compose.db.yml up -d
docker compose -f docker-compose.apps.yml up -d

# View logs
docker compose -f docker-compose.apps.yml logs -f

# Stop everything
docker compose -f docker-compose.apps.yml down
docker compose -f docker-compose.db.yml down
```

### Check Everything is Working
```bash
# Health checks
curl http://localhost:3000/api/health
curl http://localhost:5173
curl http://localhost:5050

# Database check
docker compose -f docker-compose.db.yml exec db pg_isready -U postgres
```

## 🎯 Architecture Benefits

### Separation of Concerns
- **Database**: Independent lifecycle, can run without apps
- **Applications**: Can be restarted without affecting database
- **Development**: Fast iteration on code changes

### Network Architecture
- **Shared Network**: `sgp_shared_network` connects all services
- **Service Discovery**: Containers communicate via service names
- **Isolation**: Each compose file manages its own resources

### Data Persistence
- **Database**: Survives container restarts and rebuilds
- **Application**: Stateless, can be freely restarted
- **Development**: Volume mounts for hot reload