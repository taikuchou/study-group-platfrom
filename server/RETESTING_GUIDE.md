# Study Group Platform API - Step-by-Step Retesting Guide

Complete guide for retesting the Study Group Platform API from setup to execution.

## 🚀 **Phase 1: Environment Setup**

### Step 1.1: Prerequisites Check
```bash
# Check Node.js version (requires 18+)
node --version

# Check PostgreSQL status
brew services list | grep postgresql
# OR on Linux:
sudo systemctl status postgresql

# If PostgreSQL not running:
brew services start postgresql
# OR on Linux:
sudo systemctl start postgresql
```

### Step 1.2: Project Setup
```bash
# Navigate to server directory
cd server

# Install all dependencies
npm install

# Verify TypeScript compilation
npm run build
```

### Step 1.3: Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# Edit environment variables (use your preferred editor)
nano .env
```

**Required Environment Variables:**
```bash
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/study_group_platform?schema=public"

# JWT Secrets (change in production)
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-in-production"
JWT_EXPIRE="15m"
JWT_REFRESH_EXPIRE="7d"

# Server
PORT=3000
NODE_ENV="development"

# CORS
ALLOWED_ORIGINS="http://localhost:5173,http://localhost:3000"
```

## 🗄️ **Phase 2: Database Setup**

### Step 2.1: Database Creation
```bash
# Create main database
createdb study_group_platform

# Verify database exists
psql -l | grep study_group_platform
```

### Step 2.2: Prisma Setup
```bash
# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Seed database with sample data
npm run prisma:seed
```

### Step 2.3: Verify Database Setup
```bash
# Open Prisma Studio (optional)
npm run prisma:studio

# Or check tables directly
psql study_group_platform -c "\dt"
```

**Expected Tables:**
- users
- topics
- sessions
- topic_attendees
- session_attendees
- interactions

## 🧪 **Phase 3: Test Environment Preparation**

### Step 3.1: Test Dependencies Check
```bash
# Verify test dependencies are installed
npm list jest ts-jest supertest

# If missing, install:
npm install --save-dev jest ts-jest supertest @types/jest @types/supertest uuid @types/uuid
```

### Step 3.2: Test Database Permissions
```bash
# Verify PostgreSQL user can create/drop databases
createdb test_permission_check
dropdb test_permission_check
```

If this fails, grant permissions:
```sql
-- Connect as postgres superuser
psql -U postgres

-- Grant permissions
ALTER USER postgres CREATEDB;
GRANT ALL PRIVILEGES ON DATABASE postgres TO postgres;
```

### Step 3.3: Jest Configuration Verification
```bash
# Check Jest configuration
cat jest.config.js

# Verify test setup file exists
ls -la src/__tests__/utils/setup.ts
```

## 🔧 **Phase 4: Server Testing**

### Step 4.1: Development Server Test
```bash
# Start development server
npm run dev

# Server should start on port 3000
# Expected output:
# 🚀 Server running on port 3000
# 📊 Environment: development
# 🔗 API Base URL: http://localhost:3000/api
```

### Step 4.2: API Endpoint Manual Testing
**Open new terminal and test key endpoints:**

```bash
# Health check
curl http://localhost:3000/api/health

# Expected response:
# {"status":"OK","timestamp":"...","service":"Study Group Platform API"}

# API documentation
curl http://localhost:3000/

# Expected response:
# {"message":"Study Group Platform API","version":"1.0.0",...}
```

### Step 4.3: Authentication Flow Test
```bash
# Register new user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'

# Should return user data with accessToken and refreshToken
```

**Stop the development server (Ctrl+C) before proceeding to automated tests.**

## 🎯 **Phase 5: Automated Test Execution**

### Step 5.1: Run Individual Test Suites

#### Authentication Tests
```bash
npm test auth.test.ts

# Expected output:
# Authentication Service
#   ✓ POST /api/auth/register - should register a new user successfully
#   ✓ POST /api/auth/login - should login with valid credentials
#   ... (16 tests total)
```

#### User Management Tests
```bash
npm test users.test.ts

# Expected output:
# User Management Service
#   ✓ GET /api/users - should allow admin to list all users
#   ✓ POST /api/users - should allow admin to create new user
#   ... (12 tests total)
```

#### Topic Management Tests
```bash
npm test topics.test.ts

# Expected output:
# Topic Management Service
#   ✓ GET /api/topics - should return list of topics for authenticated user
#   ✓ POST /api/topics - should create new topic with valid data
#   ... (15 tests total)
```

#### Session Management Tests
```bash
npm test sessions.test.ts

# Expected output:
# Session Management Service
#   ✓ GET /api/sessions - should return list of sessions for authenticated user
#   ✓ POST /api/sessions - should allow admin to create new session
#   ... (12 tests total)
```

#### Interaction Management Tests
```bash
npm test interactions.test.ts

# Expected output:
# Interaction Management Service
#   ✓ GET /api/interactions - should return list of interactions for authenticated user
#   ✓ POST /api/interactions - should create question interaction
#   ... (18 tests total)
```

### Step 5.2: Integration Tests
```bash
npm test integration/

# Expected output:
# API Integration Tests
#   ✓ Complete User Journey - should complete full study group workflow
#   ✓ Error Handling Integration - should handle cascading permission errors
#   ... (6 comprehensive scenarios)
```

### Step 5.3: Full Test Suite
```bash
# Run all tests
npm test

# Expected summary:
# Test Suites: 6 passed, 6 total
# Tests: 73+ passed, 73+ total
# Snapshots: 0 total
# Time: ~30-60s
```

## 📊 **Phase 6: Test Analysis & Coverage**

### Step 6.1: Coverage Report
```bash
# Generate coverage report
npm test -- --coverage

# View coverage in browser
open coverage/lcov-report/index.html
```

**Expected Coverage Targets:**
- Statements: > 90%
- Branches: > 85%
- Functions: > 90%
- Lines: > 90%

### Step 6.2: Verbose Test Output
```bash
# Run with verbose output for debugging
npm test -- --verbose

# Run specific test with pattern matching
npm test -- --testNamePattern="should register new user" --verbose
```

### Step 6.3: Watch Mode (Development)
```bash
# Start watch mode for continuous testing during development
npm run test:watch

# Press 'a' to run all tests
# Press 'f' to run only failed tests
# Press 'p' to filter by test name pattern
# Press 'q' to quit
```

## 🚨 **Phase 7: Troubleshooting Common Issues**

### Issue 7.1: Database Connection Errors
```bash
# Check PostgreSQL status
pg_isready

# If connection fails:
# 1. Check PostgreSQL is running
brew services restart postgresql

# 2. Check database exists
createdb study_group_platform

# 3. Check connection string in .env
cat .env | grep DATABASE_URL
```

### Issue 7.2: Permission Errors
```bash
# Grant database creation permissions
psql -U postgres -c "ALTER USER postgres CREATEDB;"

# Or use a different user with proper permissions
psql -c "CREATE USER testuser WITH PASSWORD 'password' CREATEDB;"
```

### Issue 7.3: Port Conflicts
```bash
# Check what's running on port 3000
lsof -i :3000

# Kill process using port 3000
kill -9 $(lsof -ti:3000)

# Or use different port
PORT=3000 npm run dev
```

### Issue 7.4: Jest Memory Issues
```bash
# Run tests with limited workers
npm test -- --maxWorkers=1 --runInBand

# Increase memory limit
NODE_OPTIONS="--max-old-space-size=4096" npm test
```

### Issue 7.5: Test Timeout Issues
```bash
# Increase timeout for slower systems
npm test -- --testTimeout=15000

# Or update jest.config.js
# testTimeout: 15000
```

## 🔄 **Phase 8: Continuous Testing Workflow**

### Step 8.1: Pre-commit Testing
```bash
# Create pre-commit script
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/sh
cd server && npm test
if [ $? -ne 0 ]; then
  echo "Tests failed. Commit aborted."
  exit 1
fi
EOF

chmod +x .git/hooks/pre-commit
```

### Step 8.2: Development Workflow
```bash
# 1. Start watch mode in one terminal
npm run test:watch

# 2. Start development server in another
npm run dev

# 3. Make changes and watch tests automatically rerun
```

### Step 8.3: Production Readiness Check
```bash
# 1. Run full test suite
npm test

# 2. Check build
npm run build

# 3. Check production server start
NODE_ENV=production npm start
```

## 📋 **Phase 9: Test Results Validation**

### Step 9.1: Expected Test Results

**Unit Tests Breakdown:**
- ✅ Authentication: 16/16 tests passing
- ✅ Users: 12/12 tests passing
- ✅ Topics: 15/15 tests passing
- ✅ Sessions: 12/12 tests passing
- ✅ Interactions: 18/18 tests passing

**Integration Tests:**
- ✅ Complete User Journey: Full workflow test
- ✅ Error Handling: Permission validation
- ✅ Data Consistency: Referential integrity
- ✅ Concurrent Access: Multi-user scenarios
- ✅ API Health: System endpoints

### Step 9.2: Performance Validation
```bash
# Check test execution time
npm test 2>&1 | grep "Time:"

# Should complete within:
# - Unit tests: < 30 seconds
# - Integration tests: < 60 seconds
# - Total suite: < 90 seconds
```

### Step 9.3: Security Validation Checklist
- ✅ JWT authentication working
- ✅ Password hashing verified
- ✅ Admin-only endpoints protected
- ✅ User permission boundaries enforced
- ✅ Input validation active
- ✅ SQL injection prevention confirmed

## 🏁 **Phase 10: Final Verification**

### Step 10.1: Clean Environment Test
```bash
# Clean install and test
rm -rf node_modules package-lock.json
npm install
npm test
```

### Step 10.2: Production-like Environment
```bash
# Set production environment
NODE_ENV=production npm test

# Verify with production database (if available)
DATABASE_URL="postgresql://prod_user:prod_pass@prod_host:5432/prod_db" npm test
```

### Step 10.3: Documentation Verification
```bash
# Check all documentation files exist
ls -la README.md TESTING.md RETESTING_GUIDE.md

# Verify API endpoints match documentation
curl http://localhost:3000/ | jq .endpoints
```

## ✅ **Success Criteria**

Your retest is successful when:
- [ ] All 73+ tests pass
- [ ] Coverage > 90% statements
- [ ] No database connection errors
- [ ] All API endpoints respond correctly
- [ ] Authentication flow works end-to-end
- [ ] Integration scenarios complete successfully
- [ ] No memory leaks or timeouts
- [ ] Production build compiles successfully

## 🆘 **Getting Help**

If you encounter issues:

1. **Check Logs**: Look for specific error messages
2. **Database Issues**: Verify PostgreSQL status and permissions
3. **Port Conflicts**: Use different ports or kill conflicting processes
4. **Memory Issues**: Reduce test concurrency or increase Node memory
5. **Timeout Issues**: Increase Jest timeout settings

**Debug Mode:**
```bash
# Enable debug output
DEBUG=* npm test

# Run single test with full debugging
node --inspect-brk node_modules/.bin/jest --runInBand --testNamePattern="your test name"
```

This guide ensures you can reliably retest the entire Study Group Platform API from a clean state to full validation!
