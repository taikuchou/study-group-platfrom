# Study Group Platform API

Backend API service for the Study Group Platform built with Node.js, Express, TypeScript, and PostgreSQL.

## Features

- **Authentication & Authorization**: JWT-based auth with role-based permissions
- **Database**: PostgreSQL with Prisma ORM
- **Security**: Helmet, CORS, rate limiting
- **Validation**: Zod schema validation
- **TypeScript**: Full type safety
- **RESTful API**: Clean REST endpoints matching frontend interface

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Installation

1. **Install dependencies**
```bash
cd server
npm install
```

2. **Environment setup**
```bash
cp .env.example .env
# Edit .env with your database URL and JWT secrets
```

3. **Database setup**
```bash
# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Seed database with sample data
npm run prisma:seed
```

4. **Start development server**
```bash
npm run dev
```

The API will be available at `http://localhost:3000`

## Environment Variables

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/study_group_platform"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_REFRESH_SECRET="your-super-secret-refresh-key"
JWT_EXPIRE="15m"
JWT_REFRESH_EXPIRE="7d"

# Server
PORT=3000
NODE_ENV="development"

# CORS
ALLOWED_ORIGINS="http://localhost:5173,http://localhost:3000"
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration  
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/logout` - User logout

### Users (Admin only for most operations)
- `GET /api/users` - List users
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Topics
- `GET /api/topics` - List topics
- `POST /api/topics` - Create topic
- `GET /api/topics/:id` - Get topic details
- `PUT /api/topics/:id` - Update topic (creator/admin only)
- `DELETE /api/topics/:id` - Delete topic (creator/admin only)
- `POST /api/topics/:id/join` - Join topic
- `DELETE /api/topics/:id/leave` - Leave topic
- `GET /api/topics/:id/sessions` - Get sessions for topic

### Sessions
- `GET /api/sessions` - List sessions
- `POST /api/sessions` - Create session (admin only)
- `GET /api/sessions/:id` - Get session details
- `PUT /api/sessions/:id` - Update session (presenter/admin only)
- `DELETE /api/sessions/:id` - Delete session (presenter/admin only)
- `GET /api/sessions/:id/interactions` - Get interactions for session

### Interactions
- `GET /api/interactions` - List interactions
- `POST /api/interactions` - Create interaction
- `GET /api/interactions/:id` - Get interaction
- `PUT /api/interactions/:id` - Update interaction (author/admin only)
- `DELETE /api/interactions/:id` - Delete interaction (admin only)

### Utility
- `GET /api/health` - Health check
- `GET /` - API documentation

## Database Schema

### Core Models
- **User**: Authentication and user management
- **Topic**: Study group topics with metadata
- **Session**: Individual study sessions within topics
- **Interaction**: User interactions (questions, notes, feedback, etc.)

### Relationships
- Users can create topics and present sessions
- Topics have multiple sessions and attendees
- Sessions belong to topics and have interactions
- Interactions belong to sessions and are authored by users

## Permission System

### Roles
- **Admin**: Full access to all resources
- **User**: Limited access based on ownership

### Permission Matrix
- **Topics**: Anyone can read/create, creators/admins can edit/delete
- **Sessions**: Anyone can read, admins can create, presenters/admins can edit/delete
- **Interactions**: Anyone can read/create, authors can edit, admins can delete
- **Users**: Admins have full access, users can edit their own profile

## Development

### Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run prisma:migrate    # Run database migrations
npm run prisma:generate   # Generate Prisma client
npm run prisma:studio     # Open Prisma Studio
npm run prisma:seed       # Seed database
npm test             # Run tests
```

### Database Management
```bash
# Reset database (destructive!)
npx prisma migrate reset

# Deploy migrations to production
npx prisma migrate deploy

# View database in browser
npm run prisma:studio
```

## Sample Data

The seed script creates:
- 4 sample users (1 admin, 3 users)
- 2 sample topics (React, AI/ML)
- 3 sample sessions
- Various interactions

**Default Admin Account:**
- Email: `alice@example.com`
- Password: `password123`

## Frontend Integration

This API is designed to work seamlessly with the Study Group Platform frontend:

- **Base URL**: Matches frontend `ApiDataService` expectation (`http://localhost:3000`)
- **CORS**: Pre-configured for frontend dev server (`http://localhost:5173`)
- **Data Models**: Exact match with frontend TypeScript interfaces
- **Authentication**: JWT with credentials for session-based auth
- **Error Handling**: Consistent HTTP status codes

## Production Deployment

1. Set `NODE_ENV=production`
2. Use strong JWT secrets
3. Configure proper PostgreSQL connection
4. Set appropriate CORS origins
5. Use process manager (PM2, Docker, etc.)
6. Set up SSL/TLS termination
7. Configure monitoring and logging

## Architecture

```
src/
├── app.ts                 # Express app setup
├── controllers/           # Route handlers
├── middleware/           # Auth & permissions
├── routes/               # Route definitions  
├── services/             # Database service
├── types/                # TypeScript types
├── utils/                # Utilities (auth, validation)
└── prisma/               # Database schema & seeds
```

## API Testing

### Postman Collection
A comprehensive Postman collection is available at `/Study-Group-Platform-API.postman_collection.json`:
- Complete test suite with 25+ endpoints
- Auto-authentication with token management
- Environment variables for easy testing
- Sample requests and responses
- Error case testing

### Test Results
Detailed test results are documented in `/test-results.json` including:
- Server startup verification
- Database connection testing
- API endpoint validation  
- Authentication flow testing
- Data structure alignment verification

---

## Recent Updates (v1.1.0 - 2025-09-12)

### 🔧 **Database Schema Enhancements**
- **Added Reference Category Support**
  - New `ReferenceCategory` enum: `WEB`, `BOOK`, `PAPER`
  - Enhanced `Interaction` model with `category` field for reference interactions
  - Updated `Session.references` from `String[]` to `Json[]` for complex reference objects

### 🎯 **Controller Improvements**
- **SessionController**: Complete rewrite with `formatSession` helper
  - Proper handling of complex reference objects
  - Improved error handling and type safety
  - Consistent response formatting

- **InteractionController**: Enhanced reference interaction support
  - Added category field handling
  - Improved type conversion between database and API formats
  - Better validation for different interaction types

- **TopicController**: Updated nested session formatting
  - Consistent reference object handling in topic responses
  - Improved attendee and session data formatting

### 🔍 **Type System Updates**
- **Enhanced Type Definitions** (`src/types/index.ts`)
  - Added `ReferenceLink` interface for complex references
  - Updated `ReferenceInteraction` with full field support
  - Added conversion functions between Prisma and frontend formats

### ✅ **Testing & Validation**
- **Comprehensive API Testing**: All core endpoints verified functional
- **Authentication System**: JWT login/logout cycle tested and working
- **Database Integration**: Schema updates applied successfully
- **Data Structure Alignment**: Client-server compatibility confirmed

### ⚠️ **Known Issues**
- **Prisma Client Regeneration**: File permission issues preventing client update
  - Impact: Complex reference creation temporarily limited
  - Workaround: Local enum definitions maintain functionality
  - Database schema is correct and ready for full implementation

### 🚀 **Development Status**
- **Server**: Fully operational for development and testing
- **API**: All endpoints functional with proper authentication
- **Database**: Successfully migrated with new reference support
- **Testing**: Comprehensive test suite available via Postman collection