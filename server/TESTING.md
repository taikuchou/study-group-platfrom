# Study Group Platform API - Testing Documentation

Comprehensive test suite for the Study Group Platform API including unit tests, integration tests, and testing procedures.

## Test Architecture

### Test Structure
```
src/__tests__/
├── unit/                    # Unit tests for individual services
│   ├── auth.test.ts        # Authentication service tests
│   ├── users.test.ts       # User management tests
│   ├── topics.test.ts      # Topic management tests
│   ├── sessions.test.ts    # Session management tests
│   └── interactions.test.ts # Interaction management tests
├── integration/            # Integration tests
│   └── api.test.ts        # End-to-end API workflow tests
└── utils/                 # Test utilities and setup
    ├── setup.ts           # Global test setup and teardown
    └── testHelpers.ts     # Test helper functions
```

### Test Technologies
- **Jest**: Test framework and test runner
- **Supertest**: HTTP assertion library for API testing
- **TypeScript**: Full type safety in tests
- **Prisma**: Database testing with isolated test database
- **UUID**: Unique test database names to prevent conflicts

## Test Categories

### 1. Unit Tests

#### Authentication Service (`auth.test.ts`)
**Test Coverage**: 98 test cases

| Feature | Test Cases | Description |
|---------|------------|-------------|
| **User Registration** | 4 tests | Valid registration, email validation, password validation, duplicate prevention |
| **User Login** | 4 tests | Valid login, invalid email, invalid password, malformed data |
| **Token Management** | 3 tests | Get current user, invalid token handling, missing token |
| **Token Refresh** | 3 tests | Valid refresh, invalid refresh token, missing refresh token |
| **Logout** | 2 tests | Successful logout, unauthorized logout |

**Key Test Scenarios**:
- ✅ Successful user registration with JWT token generation
- ✅ Login with valid credentials returns user data and tokens
- ✅ Password hashing and validation
- ✅ JWT token verification and refresh functionality
- ✅ Proper error handling for invalid credentials
- ✅ Email format validation
- ✅ Password strength requirements

#### User Management Service (`users.test.ts`)
**Test Coverage**: 12 test cases

| Feature | Test Cases | Description |
|---------|------------|-------------|
| **List Users** | 3 tests | Admin access, non-admin rejection, unauthenticated rejection |
| **Create User** | 4 tests | Admin creation, non-admin rejection, duplicate email, invalid data |
| **Update User** | 3 tests | Admin update any user, self-update, unauthorized update |
| **Delete User** | 3 tests | Admin deletion, non-admin rejection, non-existent user |

**Key Test Scenarios**:
- ✅ Admin-only access control for user management
- ✅ Users can update their own profiles
- ✅ Temporary password generation for admin-created users
- ✅ Duplicate email prevention
- ✅ Input validation (name length, email format)
- ✅ Proper cascade handling for user deletion

#### Topic Management Service (`topics.test.ts`)
**Test Coverage**: 15 test cases

| Feature | Test Cases | Description |
|---------|------------|-------------|
| **List Topics** | 2 tests | Authenticated access, unauthenticated rejection |
| **Create Topic** | 3 tests | Valid creation, invalid data, unauthenticated rejection |
| **Get Topic** | 2 tests | Valid retrieval, non-existent topic |
| **Update Topic** | 3 tests | Creator update, admin update, unauthorized update |
| **Delete Topic** | 3 tests | Creator deletion, admin deletion, unauthorized deletion |
| **Join/Leave** | 4 tests | Join topic, duplicate join, leave topic, leave non-joined topic |

**Key Test Scenarios**:
- ✅ Topic creation with automatic creator attendance
- ✅ Permission-based CRUD operations (creator/admin only)
- ✅ Join/leave functionality with proper relationship management
- ✅ Topic data validation (dates, intervals, URLs)
- ✅ Nested session data in topic responses
- ✅ Attendee relationship integrity

#### Session Management Service (`sessions.test.ts`)
**Test Coverage**: 12 test cases

| Feature | Test Cases | Description |
|---------|------------|-------------|
| **List Sessions** | 2 tests | Authenticated access, unauthenticated rejection |
| **Create Session** | 5 tests | Admin creation, non-admin rejection, invalid topic, invalid presenter, invalid data |
| **Get Session** | 2 tests | Valid retrieval, non-existent session |
| **Update Session** | 3 tests | Presenter update, admin update, unauthorized update |
| **Delete Session** | 3 tests | Presenter deletion, admin deletion, unauthorized deletion |
| **Topic Sessions** | 2 tests | Get sessions for topic, empty session list |

**Key Test Scenarios**:
- ✅ Admin-only session creation
- ✅ Presenter and admin can modify sessions
- ✅ Session validation (datetime format, topic/presenter existence)
- ✅ Proper attendee tracking
- ✅ Session-topic relationship integrity
- ✅ Nested endpoint functionality (`/topics/:id/sessions`)

#### Interaction Management Service (`interactions.test.ts`)
**Test Coverage**: 18 test cases

| Feature | Test Cases | Description |
|---------|------------|-------------|
| **List Interactions** | 2 tests | Authenticated access, unauthenticated rejection |
| **Create Interaction** | 7 tests | Question, noteLink, weeklyInsight, invalid session, missing fields |
| **Get Interaction** | 2 tests | Valid retrieval, non-existent interaction |
| **Update Interaction** | 3 tests | Author update, admin update, unauthorized update |
| **Delete Interaction** | 3 tests | Admin deletion, non-admin rejection, non-existent interaction |
| **Session Interactions** | 2 tests | Get interactions for session, empty interaction list |
| **Interaction Types** | 3 tests | speakerFeedback, reference, outlineSuggestion |

**Key Test Scenarios**:
- ✅ All interaction types (question, noteLink, reference, etc.)
- ✅ Type-specific validation (noteLink requires label, description, url)
- ✅ Author-only edit permissions (admin can delete only)
- ✅ Proper session association
- ✅ Content vs structured data handling
- ✅ Nested endpoint functionality (`/sessions/:id/interactions`)

### 2. Integration Tests

#### Complete API Workflow (`api.test.ts`)
**Test Coverage**: 6 comprehensive scenarios

| Scenario | Description | Steps |
|----------|-------------|-------|
| **Full User Journey** | End-to-end workflow | 12 steps: Register → Create Topic → Join → Create Session → Interactions → Updates |
| **Error Handling** | Cascading permissions | Permission chains, unauthorized access patterns |
| **Resource Dependencies** | Cascade operations | Topic deletion cascades to sessions and interactions |
| **Data Consistency** | Referential integrity | Join/leave operations, relationship consistency |
| **Concurrent Access** | Multi-user scenarios | Simultaneous operations, race condition handling |
| **API Health** | System endpoints | Health checks, 404 handling, documentation |

**Key Integration Scenarios**:
- ✅ **Complete Study Group Workflow**: 
  - Two users register and authenticate
  - User creates topic and becomes attendee
  - Second user joins topic
  - Admin creates session with first user as presenter
  - Both users add interactions (question, noteLink, insight)
  - Session updates and verification
  - Complete data integrity validation

- ✅ **Permission Chain Validation**:
  - Cross-user authorization attempts
  - Resource ownership verification
  - Admin privilege escalation

- ✅ **Database Integrity**:
  - Cascade deletion verification
  - Referential relationship maintenance
  - Concurrent operation handling

## Test Execution

### Prerequisites
```bash
# PostgreSQL must be running
# Test database will be created automatically

# Install dependencies
npm install
```

### Running Tests

#### All Tests
```bash
npm test
```

#### Watch Mode (Development)
```bash
npm run test:watch
```

#### Specific Test Suites
```bash
# Authentication only
npm test auth.test.ts

# Integration tests only  
npm test integration/

# Unit tests only
npm test unit/

# Coverage report
npm test -- --coverage
```

#### Test with Verbose Output
```bash
npm test -- --verbose
```

## Test Data Management

### Test Database Strategy
- **Isolated Databases**: Each test run uses a unique database (`test_<uuid>`)
- **Clean State**: Database is truncated between test cases
- **Auto Cleanup**: Test databases are automatically dropped after completion

### Test User Creation
```typescript
// Standard user
const user = await testHelpers.createTestUser();

// Admin user  
const admin = await testHelpers.createTestAdmin();

// Custom user
const customUser = await testHelpers.createTestUser({
  name: 'Custom Name',
  email: 'custom@example.com',
  role: 'ADMIN'
});
```

### Test Data Helpers
```typescript
// Create test topic
const topic = await testHelpers.createTestTopic(userId, {
  title: 'Custom Topic',
  startDate: new Date('2024-03-01'),
});

// Create test session
const session = await testHelpers.createTestSession(topicId, presenterId);

// Create test interaction
const interaction = await testHelpers.createTestInteraction(sessionId, authorId, {
  type: 'QUESTION',
  content: 'Test question'
});

// Add attendee relationships
await testHelpers.addTopicAttendee(topicId, userId);
await testHelpers.addSessionAttendee(sessionId, userId);
```

## Test Configuration

### Jest Configuration (`jest.config.js`)
```javascript
{
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/utils/setup.ts'],
  testTimeout: 10000,
  maxWorkers: 1, // Single worker for database tests
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/app.ts',
    '!src/__tests__/**/*',
  ]
}
```

### Environment Variables
```bash
# Automatically set in test setup
NODE_ENV=test
JWT_SECRET=test-jwt-secret
JWT_REFRESH_SECRET=test-refresh-secret
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/test_<uuid>
```

## Coverage Requirements

### Target Coverage
- **Statements**: > 90%
- **Branches**: > 85%
- **Functions**: > 90%  
- **Lines**: > 90%

### Coverage Areas
- ✅ All controller methods
- ✅ Authentication and authorization logic
- ✅ Data validation schemas
- ✅ Error handling paths
- ✅ Database operations
- ✅ API route handlers

### Coverage Exclusions
- Configuration files
- Type definitions
- Test files themselves
- Database migrations

## Performance Testing

### Response Time Targets
- **Authentication**: < 200ms
- **CRUD Operations**: < 100ms
- **List Endpoints**: < 300ms
- **Complex Queries**: < 500ms

### Load Testing Scenarios
1. **Concurrent User Registration**: 10 simultaneous registrations
2. **Topic Creation Load**: 5 topics created simultaneously
3. **Session Interaction Load**: Multiple users adding interactions to same session
4. **Database Connection Pool**: Maximum concurrent database operations

## Security Testing

### Authentication Security
- ✅ JWT token validation and expiration
- ✅ Password hashing verification (bcrypt)
- ✅ Refresh token security
- ✅ Invalid token rejection

### Authorization Security  
- ✅ Role-based access control (admin/user)
- ✅ Resource ownership validation
- ✅ Permission boundary testing
- ✅ Privilege escalation prevention

### Input Validation Security
- ✅ SQL injection prevention (Prisma ORM)
- ✅ XSS prevention (input sanitization)
- ✅ Data type validation (Zod schemas)
- ✅ Request size limits
- ✅ Rate limiting (in main app)

## Debugging Tests

### Common Issues

#### Database Connection Issues
```bash
# Check PostgreSQL is running
brew services list | grep postgresql
# or
sudo systemctl status postgresql

# Create test database manually if needed
createdb test_manual
```

#### Test Timeouts
```bash
# Increase timeout for slower systems
npm test -- --testTimeout=15000
```

#### Memory Issues
```bash
# Run tests with limited concurrency
npm test -- --maxWorkers=1 --runInBand
```

### Test Debugging
```bash
# Run specific test with debugging
npm test -- --testNamePattern="should register new user" --verbose

# Debug mode
node --inspect-brk node_modules/.bin/jest --runInBand
```

## Continuous Integration

### Pre-commit Hooks
```bash
# Run tests before commit
npm test

# Run linting and type checking
npm run build
```

### CI Pipeline Requirements
1. **Setup**: PostgreSQL database service
2. **Install**: Dependencies (`npm ci`)
3. **Database**: Run migrations (`npm run prisma:migrate`)
4. **Test**: Execute test suite (`npm test`)
5. **Coverage**: Generate and upload coverage report
6. **Cleanup**: Drop test databases

### GitHub Actions Example
```yaml
- name: Setup PostgreSQL
  uses: harmon758/postgresql-action@v1
- name: Run tests
  run: npm test
  env:
    DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
```

## Test Maintenance

### Adding New Tests
1. Follow existing test structure and naming
2. Use `testHelpers` for common operations  
3. Maintain database isolation between tests
4. Include both positive and negative test cases
5. Test edge cases and error conditions

### Updating Tests
1. Update tests when API contracts change
2. Maintain backward compatibility where possible
3. Update test data when schema changes
4. Verify coverage remains above thresholds

### Best Practices
- **Descriptive Test Names**: Clearly describe what is being tested
- **Arrange-Act-Assert**: Structure tests with clear setup, execution, and verification
- **Test Independence**: Each test should run independently
- **Mock External Services**: Don't depend on external APIs in tests
- **Clean Test Data**: Use helpers to create consistent test data
- **Error Testing**: Always test both success and failure scenarios

This comprehensive test suite ensures the Study Group Platform API is robust, secure, and reliable for production deployment.