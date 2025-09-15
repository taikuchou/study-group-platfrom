# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Study Group Platform** built with:
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS 
- **Icons**: lucide-react
- **State Management**: React Context API with custom DataContext
- **Data Layer**: Service pattern with mock/API abstraction

## Development Commands

### Core Commands
```bash
npm run dev    # Start development server (http://localhost:5173)
npm run build  # Build for production  
npm run preview # Preview production build
```

### Setup
```bash
npm install    # Install dependencies
```

## Architecture

### Data Architecture
The app uses a **Service Pattern** with data source abstraction:

- **DataContext** (`src/context/DataContext.tsx`): Main state management, provides `useData()` hook
- **DataService Interface** (`src/services/DataService.ts`): Abstract service interface
- **MockDataService** (`src/services/MockDataService.ts`): Mock implementation (default)
- **ApiDataService** (`src/services/ApiDataService.ts`): Real API implementation
- **Data switching**: Currently hardcoded to use mock data (`useMock = true` in DataContext)

### Component Structure
```
src/
├── components/
│   ├── StudyGroupPlatform.tsx    # Main platform component
│   ├── TopicList.tsx            # Topic listing with filtering
│   ├── SessionDetail.tsx        # Session detail view
│   └── UserManagement.tsx       # Admin user management
├── context/
│   ├── DataContext.tsx          # Global state management
│   └── Ownership.ts             # Permission system
├── services/                    # Data access layer
├── types/                       # TypeScript definitions
└── data/mockData.ts            # Mock data
```

### Key Domain Models
- **User**: Basic user with role-based permissions (user/admin)
- **Topic**: Study topics with sessions, keywords, and participants
- **Session**: Individual study sessions within topics
- **Interaction**: User interactions (questions, feedback, notes, etc.)

### Permission System
- Uses `canPerform()` function from `Ownership.ts`
- Role-based access control (user/admin)
- Ownership-based permissions for CRUD operations

## Current Configuration

### Environment Variables
- `REACT_APP_USE_MOCK=true` - Forces mock data usage
- `NEXT_PUBLIC_API_URL=https://localhost:3000` - API endpoint (when using real API)

### Data Source Switching  
The platform is designed to switch between mock and API data sources, but currently hardcoded to mock:
```typescript
// In DataContext.tsx
const useMock = true; // Always uses mock data
```

## Development Notes

### TypeScript Configuration
- Uses strict mode with ES2020 target
- Note: `tsconfig.json` has unusual `"include": ["src__2"]` - should likely be `["src"]`

### Styling
- Tailwind CSS configured via `tailwind.config.ts`
- Global styles in `src/index.css`
- Uses utility-first approach with responsive design

### State Management Pattern
- Single DataProvider wraps entire app
- All data operations go through DataContext
- Components use `useData()` hook for state access
- Follows React best practices with proper context usage

## No Linting/Testing
- **No ESLint** configuration (as noted in README)
- **No testing framework** currently configured
- **No pre-commit hooks** or code quality gates