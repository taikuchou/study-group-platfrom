# Study Group Platform - Frontend

React frontend application for the Study Group Platform built with React 18, TypeScript, Vite, and Tailwind CSS.

## Tech Stack

- **React 18** with TypeScript and strict mode
- **Vite** for build tooling and development server
- **Tailwind CSS** for utility-first styling
- **lucide-react** for icons
- **React Context API** for state management

## Prerequisites

- Node.js 18+ (recommend 20 LTS)
- npm, pnpm, or yarn package manager
- Backend server running on http://localhost:3000 (for API mode)

## Quick Start

### Installation
```bash
cd client
npm install
```

### Development
```bash
npm run dev
# Open http://localhost:5173
```

### Build for Production
```bash
npm run build     # Build optimized bundle
npm run preview   # Preview production build locally
```

## Architecture

### Data Layer Architecture
The app uses a **Service Pattern** with flexible data source switching:

- **DataContext** (`src/context/DataContext.tsx`): Central state management with `useData()` hook
- **Service Interface** (`src/services/DataService.ts`): Abstract service contract
- **MockDataService** (`src/services/MockDataService.ts`): Mock implementation for development
- **ApiDataService** (`src/services/ApiDataService.ts`): Production API implementation
- **Data Source Control**: Currently hardcoded to use mock data (`useMock = true`)

### Component Structure
```
src/
├── components/
│   ├── StudyGroupPlatform.tsx    # Main platform component
│   ├── TopicList.tsx            # Topic listing and filtering
│   ├── SessionDetail.tsx        # Session detail view  
│   └── UserManagement.tsx       # Admin user management
├── context/
│   ├── DataContext.tsx          # Global state management
│   └── Ownership.ts             # Permission system helpers
├── services/                    # Data access layer
├── types/                       # TypeScript definitions
├── data/                        # Mock data and constants
└── features/                    # Feature-specific components
```

## Key Features

### Data Management
- **Flexible Data Sources**: Switch between mock and API data
- **Type Safety**: Full TypeScript integration with strict typing
- **Context-Based State**: Centralized state management without external libraries
- **Permission System**: Role-based access control with ownership checks

### UI Components
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Component Library**: Reusable components following React best practices
- **Icon Integration**: Lucide React icons throughout the interface
- **Modern Styling**: Utility-first CSS with Tailwind

### Core Domain Models
- **User**: Authentication and profile management
- **Topic**: Study group topics with schedules and participants  
- **Session**: Individual study sessions with references and interactions
- **Interaction**: Questions, feedback, notes, and reference sharing

## Configuration

### Environment Variables
```bash
# Optional: Force mock data usage
REACT_APP_USE_MOCK=true

# API endpoint when using real backend
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Data Source Switching
```typescript
// In src/context/DataContext.tsx
const useMock = true; // Set to false for API mode
```

**Mock Mode (Default):**
- Uses static data from `src/data/mockData.ts`
- No backend dependency
- Perfect for UI development and testing

**API Mode:**
- Connects to backend server at `http://localhost:3000`
- Requires authentication with JWT tokens
- Full CRUD operations available

## Development Notes

### TypeScript Configuration
- **Strict Mode**: Enabled for maximum type safety
- **Target**: ES2020 with modern JavaScript features
- **Note**: `tsconfig.json` includes `["src__2"]` - should likely be `["src"]`

### No Linting/Testing Currently
- **ESLint**: Not configured (as noted in original README)
- **Testing**: No test framework currently set up
- **Quality Gates**: Manual code review process

### Styling Approach
- **Tailwind CSS**: Configured via `tailwind.config.ts`
- **Global Styles**: Available in `src/index.css`
- **Responsive Design**: Mobile-first utilities
- **Design System**: Consistent spacing, colors, and typography

## Integration with Backend

### API Compatibility
- **Base URL**: Matches backend expectation (`http://localhost:3000/api`)
- **Authentication**: JWT tokens with Bearer authorization
- **Data Models**: TypeScript interfaces align with backend API
- **Error Handling**: Consistent error response handling

### Authentication Flow
1. Login via `ApiDataService.login()`
2. Store JWT tokens in service layer
3. Include Bearer token in subsequent requests
4. Handle token refresh and expiration

### Default Test Account (API Mode)
- **Email**: `alice@example.com`
- **Password**: `password123`
- **Role**: Admin (full access)

## State Management

### DataContext Pattern
```typescript
// Access data throughout the app
const { topics, sessions, users, currentUser } = useData();

// Perform operations
await createTopic(newTopic);
await updateSession(sessionId, updates);
```

### Permission System
```typescript
// Check permissions before actions
import { canPerform } from '../context/Ownership';

if (canPerform(currentUser, 'update', topic)) {
  // Allow update operation
}
```

## Component Development Guidelines

### Following Existing Patterns
- Use existing components as templates for new features
- Follow the established TypeScript interface patterns
- Maintain consistency with Tailwind utility classes
- Use lucide-react icons for visual elements

### State Management Best Practices
- Always use `useData()` hook for data access
- Keep component state minimal and local
- Use Context for cross-component communication
- Follow React hooks rules and dependencies

## Known Configuration Issues

### TypeScript Include Path
Current `tsconfig.json` includes `["src__2"]` which should likely be `["src"]` for proper TypeScript compilation.

### Missing Development Tools
- **ESLint**: Could improve code consistency
- **Testing Framework**: Jest + React Testing Library recommended
- **Storybook**: Could help with component development

---

## Recent Updates (v1.1.0 - 2025-09-12)

### 🎯 **Data Structure Alignment**
- **Type Compatibility**: Confirmed alignment with backend API updates
- **Reference Objects**: Ready to handle complex reference structures
- **Interaction Types**: Support for enhanced reference interactions with categories

### 🔍 **Backend Integration Status**
- **Mock Data**: Fully functional for development and UI testing
- **API Integration**: Compatible with updated backend schema
- **Authentication**: Ready for JWT-based authentication flow
- **Data Models**: TypeScript interfaces match backend expectations

### ✅ **Development Readiness**
- **UI Development**: Complete mock data setup for all features
- **API Testing**: Ready to switch to live backend data
- **Type Safety**: Full TypeScript coverage for all data models
- **Component Architecture**: Scalable structure for feature expansion

### 🚀 **Next Steps for Full Integration**
1. **Switch to API Mode**: Set `useMock = false` in DataContext
2. **Start Backend**: Ensure server is running with database
3. **Test Authentication**: Login flow with admin credentials
4. **Verify Data Flow**: Test CRUD operations through UI

### 📋 **Current Capabilities**
- **Complete UI**: All major features implemented and styled
- **Mock Data**: Comprehensive test data for all scenarios  
- **Service Layer**: Abstracted data access ready for API switch
- **Type Safety**: Full TypeScript integration throughout

The frontend is ready for full backend integration and can seamlessly switch between mock and live data sources.

## Scripts Reference

```bash
npm run dev        # Start development server (http://localhost:5173)
npm run build      # Build optimized production bundle
npm run preview    # Preview production build locally
npm install        # Install all dependencies
```

## Support

For issues or questions about the frontend:
1. Check that dependencies are installed (`npm install`)
2. Verify Node.js version (18+)
3. Ensure backend is running for API mode
4. Review browser console for runtime errors