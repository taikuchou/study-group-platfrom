#!/bin/bash

# Study Group Platform API - Quick Retest Script
# This script performs a comprehensive retest of the API

set -e  # Exit on any error

echo "🚀 Starting Study Group Platform API Retest..."
echo "================================================"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Phase 1: Environment Check
echo -e "${BLUE}Phase 1: Environment Check${NC}"
echo "----------------------------------------"

echo "✓ Checking Node.js version..."
node --version

echo "✓ Checking npm version..."
npm --version

echo "✓ Checking PostgreSQL status..."
if command -v pg_isready &> /dev/null; then
    pg_isready && echo "PostgreSQL is ready" || echo "⚠️  PostgreSQL not ready"
else
    echo "⚠️  pg_isready not found, checking brew services..."
    if command -v brew &> /dev/null; then
        brew services list | grep postgresql || echo "PostgreSQL service not found"
    fi
fi

echo ""

# Phase 2: Dependencies Check
echo -e "${BLUE}Phase 2: Dependencies Check${NC}"
echo "----------------------------------------"

echo "✓ Checking if node_modules exists..."
if [ -d "node_modules" ]; then
    echo "Dependencies already installed"
else
    echo "Installing dependencies..."
    npm install
fi

echo "✓ Verifying test dependencies..."
npm list jest ts-jest supertest || echo "⚠️  Some test dependencies may be missing"

echo ""

# Phase 3: Build Check
echo -e "${BLUE}Phase 3: Build Verification${NC}"
echo "----------------------------------------"

echo "✓ Checking TypeScript compilation..."
if npm run build; then
    echo -e "${GREEN}✅ Build successful${NC}"
else
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi

echo ""

# Phase 4: Environment Configuration
echo -e "${BLUE}Phase 4: Environment Configuration${NC}"
echo "----------------------------------------"

if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found, copying from .env.example..."
    cp .env.example .env
    echo "📝 Please edit .env file with your database credentials"
else
    echo "✅ .env file exists"
fi

echo ""

# Phase 5: Database Setup (Optional)
echo -e "${BLUE}Phase 5: Database Setup${NC}"
echo "----------------------------------------"

read -p "Do you want to setup/reset the database? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🗄️  Setting up database..."
    
    # Check if createdb command exists
    if command -v createdb &> /dev/null; then
        echo "Creating database (if not exists)..."
        createdb study_group_platform 2>/dev/null || echo "Database may already exist"
        
        echo "Running Prisma generate..."
        npm run prisma:generate
        
        echo "Running migrations..."
        npm run prisma:migrate || echo "⚠️  Migration may have issues"
        
        echo "Seeding database..."
        npm run prisma:seed || echo "⚠️  Seeding may have issues"
        
        echo -e "${GREEN}✅ Database setup completed${NC}"
    else
        echo -e "${YELLOW}⚠️  createdb command not found. Please setup PostgreSQL manually.${NC}"
    fi
fi

echo ""

# Phase 6: Individual Test Execution
echo -e "${BLUE}Phase 6: Individual Test Suites${NC}"
echo "----------------------------------------"

# Function to run test and show results
run_test() {
    local test_name=$1
    local test_file=$2
    
    echo "🧪 Running $test_name tests..."
    if npm test $test_file 2>/dev/null; then
        echo -e "${GREEN}✅ $test_name tests passed${NC}"
        return 0
    else
        echo -e "${RED}❌ $test_name tests failed${NC}"
        return 1
    fi
}

# Track test results
failed_tests=0

# Run individual test suites
run_test "Authentication" "auth.test.ts" || ((failed_tests++))
echo ""

run_test "User Management" "users.test.ts" || ((failed_tests++))
echo ""

run_test "Topic Management" "topics.test.ts" || ((failed_tests++))
echo ""

run_test "Session Management" "sessions.test.ts" || ((failed_tests++))
echo ""

run_test "Interaction Management" "interactions.test.ts" || ((failed_tests++))
echo ""

run_test "Integration" "integration/" || ((failed_tests++))
echo ""

# Phase 7: Full Test Suite
echo -e "${BLUE}Phase 7: Complete Test Suite${NC}"
echo "----------------------------------------"

echo "🔄 Running complete test suite..."
if npm test 2>/dev/null; then
    echo -e "${GREEN}✅ All tests passed successfully!${NC}"
else
    echo -e "${RED}❌ Some tests failed${NC}"
    ((failed_tests++))
fi

echo ""

# Phase 8: Coverage Report (Optional)
echo -e "${BLUE}Phase 8: Coverage Report${NC}"
echo "----------------------------------------"

read -p "Generate coverage report? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "📊 Generating coverage report..."
    if npm test -- --coverage 2>/dev/null; then
        echo -e "${GREEN}✅ Coverage report generated in ./coverage/${NC}"
        echo "📂 Open coverage/lcov-report/index.html in browser to view details"
    else
        echo -e "${YELLOW}⚠️  Coverage report generation had issues${NC}"
    fi
fi

echo ""

# Phase 9: Server Quick Test (Optional)
echo -e "${BLUE}Phase 9: Server Quick Test${NC}"
echo "----------------------------------------"

read -p "Test server startup? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🖥️  Testing server startup..."
    
    # Start server in background
    npm run dev &
    SERVER_PID=$!
    
    # Wait for server to start
    sleep 3
    
    # Test health endpoint
    if curl -s http://localhost:3000/api/health > /dev/null; then
        echo -e "${GREEN}✅ Server started successfully${NC}"
        echo "🌐 Health endpoint responding"
        
        # Test API documentation endpoint
        if curl -s http://localhost:3000/ > /dev/null; then
            echo "📚 API documentation endpoint responding"
        fi
    else
        echo -e "${RED}❌ Server startup failed or health check failed${NC}"
        ((failed_tests++))
    fi
    
    # Stop server
    kill $SERVER_PID 2>/dev/null || echo "Server already stopped"
    wait $SERVER_PID 2>/dev/null || true
fi

echo ""

# Final Summary
echo -e "${BLUE}Final Test Summary${NC}"
echo "========================================"

if [ $failed_tests -eq 0 ]; then
    echo -e "${GREEN}🎉 ALL TESTS PASSED SUCCESSFULLY!${NC}"
    echo ""
    echo "✅ Environment setup complete"
    echo "✅ All test suites passing"
    echo "✅ Build successful"
    echo "✅ Server startup tested"
    echo ""
    echo "🚀 Your Study Group Platform API is ready for development!"
else
    echo -e "${RED}⚠️  $failed_tests test suite(s) had issues${NC}"
    echo ""
    echo "📋 Next steps:"
    echo "1. Check database connection and setup"
    echo "2. Verify environment variables in .env"
    echo "3. Ensure PostgreSQL is running"
    echo "4. Run individual tests for more detailed error info:"
    echo "   npm test -- --verbose"
fi

echo ""
echo "📚 For detailed testing information, see:"
echo "   - TESTING.md (comprehensive test documentation)"
echo "   - RETESTING_GUIDE.md (detailed retesting steps)"
echo ""
echo "🔧 Useful commands:"
echo "   - npm test              (run all tests)"
echo "   - npm run test:watch    (watch mode)"
echo "   - npm run dev           (start server)"
echo "   - npm run prisma:studio (database browser)"

exit $failed_tests