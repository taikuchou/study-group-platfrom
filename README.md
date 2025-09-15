# Study Group Platform

A full-stack web application for managing study groups, sessions, and collaborative learning interactions.

## Architecture Overview

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS (`/client`)
- **Backend**: Node.js + Express + TypeScript + PostgreSQL + Prisma (`/server`)
- **Database**: PostgreSQL with Prisma ORM for type-safe database operations

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL
- npm or yarn

### Development Setup

1. **Database Setup**
```bash
cd server
cp .env.example .env
# Edit .env with your PostgreSQL connection
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

2. **Start Backend**
```bash
cd server
npm install
npm run dev  # Runs on http://localhost:3000
```

3. **Start Frontend**
```bash
cd client
npm install
npm run dev  # Runs on http://localhost:5173
```

## Project Structure

```
study-group-platform-starter/
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── context/       # React Context providers
│   │   ├── services/      # Data access layer (mock/API)
│   │   ├── types/         # TypeScript type definitions
│   │   └── data/          # Mock data and constants
│   └── package.json
├── server/                # Node.js backend API
│   ├── src/
│   │   ├── controllers/   # Route handlers
│   │   ├── middleware/    # Auth, permissions, validation
│   │   ├── routes/        # Express route definitions
│   │   ├── services/      # Database service layer
│   │   ├── types/         # TypeScript type definitions
│   │   └── utils/         # Auth helpers and utilities
│   ├── prisma/           # Database schema and migrations
│   └── package.json
└── README.md
```

## Core Features

- **User Authentication**: JWT-based authentication with role-based access control
- **Study Topics**: Create and manage study topics with schedules and participants
- **Study Sessions**: Individual study sessions within topics with references and notes
- **Interactions**: Questions, feedback, insights, and reference sharing
- **Permission System**: Admin/user roles with ownership-based permissions

## API Documentation

A comprehensive Postman collection is available at `/server/Study-Group-Platform-API.postman_collection.json` for testing all API endpoints.

---

## Revision History

### Version 1.1.0 - 2025-09-12
**Major Data Structure Updates & Server Testing**

#### 🔧 **Database Schema Enhancements**
- **Added Reference Category Support**
  - New `ReferenceCategory` enum: `WEB`, `BOOK`, `PAPER`
  - Enhanced `Interaction` model with `category` field for reference interactions
  - Updated `Session.references` from `String[]` to `Json[]` to support complex reference objects

- **Schema Migration Applied**
  - Database successfully updated with new fields and enums
  - Maintained backward compatibility with existing data
  - Applied via Prisma migration system

#### 🎯 **Server-Side Type System Improvements**
- **Enhanced Type Definitions** (`server/src/types/index.ts`)
  - Added `ReferenceLink` interface matching client expectations
  - Updated `ReferenceInteraction` with full field support: `label`, `description`, `url`, `category`
  - Added conversion functions between Prisma and frontend formats

- **Controller Updates**
  - **SessionController**: Complete rewrite with `formatSession` helper for consistent reference object handling
  - **InteractionController**: Added support for reference categories and improved type handling
  - **TopicController**: Updated to format nested session references correctly

#### 🔍 **Data Structure Alignment Analysis**
**Client ↔ Server Compatibility:**
- ✅ **User Model**: Perfect alignment across all fields
- ✅ **Topic Model**: All fields correctly mapped with proper date formatting  
- ✅ **Session Model**: Schema updated to support complex `ReferenceLink[]` structure
- ✅ **Interaction Model**: Enhanced with category support for reference interactions

#### 🧪 **Comprehensive Server Testing**
**Test Results** (documented in `/server/test-results.json`):
- ✅ **Server Startup**: Successfully running on port 3000
- ✅ **Health Check**: API responding correctly
- ✅ **Authentication**: JWT login/token generation working
- ✅ **Database Connection**: PostgreSQL connected with seeded data
- ✅ **Core API Endpoints**: Topics, sessions, interactions all functional
- 🟡 **Complex References**: Schema ready, Prisma client regeneration pending

**API Testing Commands Verified:**
```bash
# Health check
curl -s http://localhost:3000/api/health

# Authentication  
curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"password123"}'

# Topics with authentication
curl -s http://localhost:3000/api/topics \
  -H "Authorization: Bearer {token}"
```

#### 📋 **Development Tools Added**
- **Postman Collection** (`/server/Study-Group-Platform-API.postman_collection.json`)
  - Complete API testing suite with 25+ endpoints
  - Auto-authentication and request chaining
  - Sample data and error case testing
  - Environment variables for easy testing

- **Test Documentation** (`/server/test-results.json`)
  - Comprehensive test results with commands and outputs
  - Data structure alignment analysis
  - Performance and functionality assessments

#### ⚠️ **Known Issues**
- **Prisma Client Regeneration**: File permission issues preventing client update
  - Impact: Complex reference creation temporarily blocked
  - Workaround: Local enum definitions added to maintain functionality
  - Database schema is correct and ready for full implementation

#### 🎉 **Validation Schema Updates**
- Enhanced Zod schemas for session and interaction validation
- Added support for complex reference objects in API requests
- Improved error handling and validation messages

#### 🚀 **Development Status**
- **Server**: Fully operational for development and testing
- **Database**: Successfully migrated and seeded
- **API**: All core endpoints functional with proper authentication
- **Frontend Integration**: Ready for client-side development and testing

#### 📈 **Performance Improvements**
- Optimized session formatting with reusable helper functions
- Improved error handling across all controllers  
- Enhanced type safety throughout the application

---

### Version 1.0.0 - Initial Release
**Foundation Setup**

#### 🏗️ **Project Structure**
- Created full-stack architecture with React frontend and Node.js backend
- Implemented PostgreSQL database with Prisma ORM
- Set up development environment with hot reloading

#### 🔐 **Authentication System**
- JWT-based authentication with access and refresh tokens
- Role-based permissions (admin/user)
- Secure password hashing with bcrypt

#### 💾 **Database Design**
- Core models: User, Topic, Session, Interaction
- Many-to-many relationships for attendees
- Proper foreign key constraints and cascading deletes

#### 🎨 **Frontend Architecture**
- React 18 with TypeScript and Vite
- Tailwind CSS for styling
- Service pattern with mock/API data switching
- Context API for state management

#### 🌐 **API Design**
- RESTful API with consistent response formats
- Comprehensive error handling
- CORS configuration for frontend integration
- Rate limiting and security middleware

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes following the existing code style
4. Test thoroughly using the provided Postman collection
5. Update documentation if needed
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

## Testing

### Backend Testing
- Use the Postman collection for comprehensive API testing
- Run `npm run test` for unit tests (when available)
- Test results documented in `/server/test-results.json`

### Frontend Testing
- Currently no testing framework configured
- Manual testing through UI interaction

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues, questions, or contributions, please refer to the project's issue tracker or contact the development team.

---

**Last Updated**: September 12, 2025  
**Version**: 1.1.0  
**Status**: Active Development