# Study Group Platform - Frontend Test Plan & Test Cases

Comprehensive test plan for the React frontend application including all functions, components, and API verifications.

## 📋 **Test Overview**

### **Test Architecture**

```
Frontend Testing Layers:
├── Unit Tests           # Component testing in isolation
├── Integration Tests    # Component interaction testing
├── API Integration     # Frontend ↔ Backend API testing
├── E2E Tests           # Complete user workflows
└── Manual Testing      # UI/UX verification
```

### **Testing Technologies**

- **React Testing Library**: Component testing
- **Jest**: Test runner and assertions
- **MSW (Mock Service Worker)**: API mocking
- **Playwright**: E2E testing
- **Storybook**: Component documentation & testing

## 🏗️ **Frontend Architecture Analysis**

### **Core Components & Functions**

#### **1. Main Application (`StudyGroupPlatform.tsx`)**

| Function               | Description                            | Test Priority |
| ---------------------- | -------------------------------------- | ------------- |
| `useState` management  | Tab switching, modals, forms           | High          |
| `setActiveTab()`       | Navigate between topics/sessions/users | High          |
| `setSelectedTopic()`   | Topic selection logic                  | High          |
| `setSelectedSession()` | Session selection logic                | High          |
| `searchQuery` handling | Search functionality                   | Medium        |
| `expandedTopicIds`     | Topic expand/collapse                  | Medium        |
| Modal state management | Form modals show/hide                  | High          |

#### **2. Data Context (`DataContext.tsx`)**

| Function              | Description           | API Endpoint                   | Test Priority |
| --------------------- | --------------------- | ------------------------------ | ------------- |
| `reload()`            | Refresh all data      | Multiple APIs                  | High          |
| `createUser()`        | Create new user       | `POST /api/users`              | High          |
| `updateUser()`        | Update user info      | `PUT /api/users/:id`           | High          |
| `deleteUser()`        | Delete user           | `DELETE /api/users/:id`        | High          |
| `createTopic()`       | Create new topic      | `POST /api/topics`             | High          |
| `updateTopic()`       | Update topic          | `PUT /api/topics/:id`          | High          |
| `deleteTopic()`       | Delete topic          | `DELETE /api/topics/:id`       | High          |
| `createSession()`     | Create new session    | `POST /api/sessions`           | High          |
| `updateSession()`     | Update session        | `PUT /api/sessions/:id`        | High          |
| `deleteSession()`     | Delete session        | `DELETE /api/sessions/:id`     | High          |
| `createInteraction()` | Create interaction    | `POST /api/interactions`       | High          |
| `updateInteraction()` | Update interaction    | `PUT /api/interactions/:id`    | High          |
| `deleteInteraction()` | Delete interaction    | `DELETE /api/interactions/:id` | High          |
| `can()`               | Permission checking   | None (client-side)             | High          |
| `OwnershipGuard`      | Conditional rendering | None                           | High          |
| `setSource()`         | Switch API/Mock       | None                           | Medium        |

#### **3. Service Layer**

| Service           | Functions           | API Endpoints     | Test Priority |
| ----------------- | ------------------- | ----------------- | ------------- |
| `ApiDataService`  | All CRUD operations | Complete REST API | High          |
| `MockDataService` | All CRUD operations | In-memory data    | Medium        |

#### **4. Permission System (`Ownership.ts`)**

| Function                        | Description                  | Test Priority |
| ------------------------------- | ---------------------------- | ------------- |
| `canPerform()`                  | General permission check     | High          |
| `canPerformSessionAction()`     | Session-specific permissions | High          |
| `canPerformInteractionAction()` | Interaction permissions      | High          |

#### **5. Feature Components**

##### **Topic Management**

| Component   | Functions               | Test Cases                  |
| ----------- | ----------------------- | --------------------------- |
| `TopicList` | Display, filter, search | Rendering, interaction      |
| `TopicForm` | Create/edit topics      | Form validation, submission |
| `useTopics` | Topic CRUD hooks        | Data operations             |

##### **Session Management**

| Component       | Functions            | Test Cases                  |
| --------------- | -------------------- | --------------------------- |
| `SessionDetail` | Display session info | Rendering, interactions     |
| `SessionForm`   | Create/edit sessions | Form validation, submission |
| `useSessions`   | Session CRUD hooks   | Data operations             |

##### **User Management**

| Component        | Functions              | Test Cases                  |
| ---------------- | ---------------------- | --------------------------- |
| `UserManagement` | User list, admin panel | Admin-only features         |
| `UserForm`       | Create/edit users      | Form validation, submission |
| `useUsers`       | User CRUD hooks        | Data operations             |

##### **Interaction Management**

| Component         | Functions                | Test Cases            |
| ----------------- | ------------------------ | --------------------- |
| `InteractionForm` | Create/edit interactions | All interaction types |
| `useInteractions` | Interaction CRUD hooks   | Data operations       |

## 🧪 **Test Cases by Category**

### **1. Unit Tests (Component Level)**

#### **A. Data Context Tests**

```typescript
// Test file: src/__tests__/context/DataContext.test.tsx

describe("DataContext", () => {
  describe("User Operations", () => {
    test("createUser should call API and update state", async () => {
      // Setup: Mock API response
      // Action: Call createUser
      // Assert: API called, state updated
    });

    test("updateUser should validate user ownership", async () => {
      // Setup: Non-admin user
      // Action: Try to update different user
      // Assert: Permission denied
    });

    test("deleteUser should require admin role", async () => {
      // Setup: Regular user
      // Action: Try to delete user
      // Assert: Permission denied
    });
  });

  describe("Topic Operations", () => {
    test("createTopic should set creator as attendee", async () => {
      // Setup: User creates topic
      // Assert: User in attendees array
    });

    test("updateTopic should allow creator and admin only", async () => {
      // Setup: Different users
      // Action: Try updates
      // Assert: Permission checks work
    });
  });

  describe("Session Operations", () => {
    test("createSession should validate presenter exists", async () => {
      // Setup: Create session with invalid presenter ID
      // Action: Call createSession
      // Assert: Error thrown or handled gracefully
    });

    test("updateSession should allow presenter and admin only", async () => {
      // Setup: Session with presenter, different user tries update
      // Action: Try to update session
      // Assert: Permission denied for non-presenter/non-admin
    });

    test("deleteSession should allow presenter and admin only", async () => {
      // Setup: Session with presenter, different user tries delete
      // Action: Try to delete session
      // Assert: Permission denied for non-presenter/non-admin
    });

    test("session data should include all required fields", async () => {
      // Setup: Create session with full data
      // Assert: All fields (topicId, presenterId, startDateTime, etc.) present
    });
  });

  describe("Permission System", () => {
    test("can() should check admin permissions", () => {
      // Setup: Admin user
      // Action: Check various permissions
      // Assert: All permissions granted
    });

    test("can() should check ownership permissions", () => {
      // Setup: Regular user, owned resource
      // Action: Check edit permission
      // Assert: Permission granted
    });

    test("OwnershipGuard should render content for authorized users", () => {
      // Setup: User with permission
      // Action: Render OwnershipGuard
      // Assert: Children rendered
    });
  });
});
```

#### **B. Component Tests**

```typescript
// Test file: src/__tests__/components/TopicForm.test.tsx

describe("TopicForm", () => {
  test("should render all form fields", () => {
    // Setup: Render component
    // Assert: All fields present
  });

  test("should validate required fields", async () => {
    // Setup: Submit empty form
    // Assert: Validation errors shown
  });

  test("should handle form submission", async () => {
    // Setup: Fill valid form
    // Action: Submit
    // Assert: onSubmit called with correct data
  });

  test("should populate fields when editing", () => {
    // Setup: Render with initialValue
    // Assert: Fields pre-populated
  });

  test("should handle reference URL management", () => {
    // Setup: Add/remove URLs
    // Assert: URLs array updated
  });
});

// Test file: src/__tests__/components/SessionForm.test.tsx

describe("SessionForm", () => {
  test("should render all session form fields", () => {
    // Setup: Render SessionForm component
    // Assert: Topic selection, presenter, date/time, scope, outline fields present
  });

  test("should validate required session fields", async () => {
    // Setup: Submit empty session form
    // Assert: Validation errors for required fields (topic, presenter, startDateTime, scope)
  });

  test("should handle session submission", async () => {
    // Setup: Fill valid session form data
    // Action: Submit form
    // Assert: onSubmit called with correct session data structure
  });

  test("should populate fields when editing session", () => {
    // Setup: Render SessionForm with existing session data
    // Assert: All fields pre-populated with session values
  });

  test("should handle attendees management", () => {
    // Setup: Add/remove attendees from session
    // Assert: Attendees array updated correctly
  });

  test("should handle note links and references arrays", () => {
    // Setup: Add/remove note links and references
    // Assert: Arrays updated properly
  });
});
```

### **2. Integration Tests (Component Interaction)**

#### **A. App Navigation Tests**

```typescript
// Test file: src/__tests__/integration/Navigation.test.tsx

describe("App Navigation", () => {
  test("should switch between tabs", () => {
    // Setup: Render app
    // Action: Click tab buttons
    // Assert: Active tab changes
  });

  test("should show/hide modals correctly", () => {
    // Setup: Click create buttons
    // Action: Open/close modals
    // Assert: Modal visibility
  });

  test("should maintain state during navigation", () => {
    // Setup: Set search query
    // Action: Switch tabs and back
    // Assert: Search query preserved
  });
});
```

#### **B. Form to Data Context Integration**

```typescript
// Test file: src/__tests__/integration/FormIntegration.test.tsx

describe("Form Integration", () => {
  test("TopicForm should create topic via DataContext", async () => {
    // Setup: Render TopicForm
    // Action: Submit form
    // Assert: DataContext.createTopic called
  });

  test("UserForm should handle permissions", async () => {
    // Setup: Non-admin user
    // Action: Try to access UserForm
    // Assert: Access denied or restricted
  });
});
```

### **3. API Integration Tests**

#### **A. Service Layer Tests**

```typescript
// Test file: src/__tests__/services/ApiDataService.test.tsx

describe("ApiDataService", () => {
  describe("User Operations", () => {
    test("listUsers should call GET /api/users", async () => {
      // Setup: Mock fetch response
      const service = new ApiDataService();

      // Action: Call listUsers
      const result = await service.listUsers();

      // Assert: Correct endpoint called, data returned
      expect(fetch).toHaveBeenCalledWith("http://localhost:3000/api/users", {
        credentials: "include",
      });
    });

    test("createUser should call POST /api/users", async () => {
      // Setup: Mock response, test data
      const service = new ApiDataService();
      const userData = {
        name: "Test",
        email: "test@example.com",
        role: "user",
      };

      // Action: Call createUser
      await service.createUser(userData);

      // Assert: POST call with correct data
      expect(fetch).toHaveBeenCalledWith("http://localhost:3000/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
        credentials: "include",
      });
    });
  });

  describe("Error Handling", () => {
    test("should handle network errors", async () => {
      // Setup: Mock network failure
      fetch.mockRejectedValue(new Error("Network error"));

      // Action: Call API method
      // Assert: Error thrown/handled appropriately
    });

    test("should handle HTTP errors", async () => {
      // Setup: Mock 404 response
      fetch.mockResolvedValue({
        ok: false,
        status: 404,
        text: () => Promise.resolve("Not found"),
      });

      // Action: Call API method
      // Assert: Appropriate error thrown
    });
  });
});
```

#### **B. Data Source Switching Tests**

```typescript
// Test file: src/__tests__/integration/DataSourceSwitching.test.tsx

describe("Data Source Switching", () => {
  test("should switch from mock to API", () => {
    // Setup: Mock data source
    // Action: Switch to API source
    // Assert: ApiDataService used
  });

  test("should maintain data consistency during switch", async () => {
    // Setup: Load data with mock
    // Action: Switch to API
    // Assert: Data reloaded from API
  });
});
```

### **4. End-to-End (E2E) Tests**

#### **A. Complete User Workflows**

```typescript
// Test file: e2e/user-workflows.spec.ts

describe("User Workflows", () => {
  test("Complete topic creation workflow", async ({ page }) => {
    // 1. Navigate to app
    await page.goto("http://localhost:5173");

    // 2. Click create topic
    await page.click('[data-testid="create-topic-btn"]');

    // 3. Fill form
    await page.fill('[data-testid="topic-title"]', "Test Topic");
    await page.fill('[data-testid="topic-start-date"]', "2024-03-01");

    // 4. Submit
    await page.click('[data-testid="submit-topic"]');

    // 5. Verify topic appears
    await expect(page.locator("text=Test Topic")).toBeVisible();
  });

  test("Session creation and interaction workflow", async ({ page }) => {
    // 1. Create topic
    // 2. Create session
    // 3. Add interactions
    // 4. Verify all data appears correctly
  });

  test("Permission-based access workflow", async ({ page }) => {
    // 1. Login as regular user
    // 2. Try to access admin features
    // 3. Verify restrictions applied
    // 4. Switch to admin user
    // 5. Verify access granted
  });
});
```

#### **B. API Integration E2E Tests**

```typescript
// Test file: e2e/api-integration.spec.ts

describe("API Integration E2E", () => {
  test("Frontend-Backend topic creation", async ({ page }) => {
    // Setup: Start both frontend and backend
    // 1. Create topic in frontend
    // 2. Verify API call made
    // 3. Check data persisted in backend
    // 4. Refresh page
    // 5. Verify data loaded from backend
  });
});
```

## 📊 **API Verification Matrix**

### **Complete API Endpoint Testing**

| HTTP Method        | Endpoint                         | Frontend Function     | Component       | Test Cases                   |
| ------------------ | -------------------------------- | --------------------- | --------------- | ---------------------------- |
| **Authentication** |                                  |                       |                 |                              |
| POST               | `/api/auth/login`                | Login flow            | UserSwitcher    | Valid/invalid credentials    |
| POST               | `/api/auth/logout`               | Logout flow           | UserSwitcher    | Session termination          |
| GET                | `/api/auth/me`                   | Current user          | DataContext     | User validation              |
| **Users**          |                                  |                       |                 |                              |
| GET                | `/api/users`                     | `listUsers()`         | UserManagement  | Admin-only access            |
| POST               | `/api/users`                     | `createUser()`        | UserForm        | Form validation, permissions |
| PUT                | `/api/users/:id`                 | `updateUser()`        | UserForm        | Self/admin edit only         |
| DELETE             | `/api/users/:id`                 | `deleteUser()`        | UserManagement  | Admin-only delete            |
| **Topics**         |                                  |                       |                 |                              |
| GET                | `/api/topics`                    | `listTopics()`        | TopicList       | Data loading, filtering      |
| GET                | `/api/topics/:id`                | `getTopic()`          | TopicDetail     | Single topic view            |
| POST               | `/api/topics`                    | `createTopic()`       | TopicForm       | Form validation              |
| PUT                | `/api/topics/:id`                | `updateTopic()`       | TopicForm       | Owner/admin only             |
| DELETE             | `/api/topics/:id`                | `deleteTopic()`       | TopicList       | Owner/admin only             |
| POST               | `/api/topics/:id/join`           | Join topic            | TopicDetail     | User join functionality      |
| DELETE             | `/api/topics/:id/leave`          | Leave topic           | TopicDetail     | User leave functionality     |
| **Sessions**       |                                  |                       |                 |                              |
| GET                | `/api/sessions`                  | Session list          | SessionList     | Data loading                 |
| POST               | `/api/sessions`                  | `createSession()`     | SessionForm     | Admin-only creation          |
| PUT                | `/api/sessions/:id`              | `updateSession()`     | SessionForm     | Presenter/admin only         |
| DELETE             | `/api/sessions/:id`              | Delete session        | SessionDetail   | Presenter/admin only         |
| GET                | `/api/topics/:id/sessions`       | Topic sessions        | TopicDetail     | Nested data loading          |
| **Interactions**   |                                  |                       |                 |                              |
| GET                | `/api/interactions`              | `listInteractions()`  | InteractionList | Data loading                 |
| POST               | `/api/interactions`              | `createInteraction()` | InteractionForm | All interaction types        |
| PUT                | `/api/interactions/:id`          | `updateInteraction()` | InteractionForm | Author/admin only            |
| DELETE             | `/api/interactions/:id`          | `deleteInteraction()` | InteractionList | Admin-only delete            |
| GET                | `/api/sessions/:id/interactions` | Session interactions  | SessionDetail   | Nested data loading          |

## 🔧 **Test Setup & Configuration**

### **1. Testing Dependencies**

```json
{
  "devDependencies": {
    "@testing-library/react": "^13.4.0",
    "@testing-library/jest-dom": "^5.16.5",
    "@testing-library/user-event": "^14.4.3",
    "msw": "^1.2.1",
    "jest": "^29.5.0",
    "jest-environment-jsdom": "^29.5.0",
    "@playwright/test": "^1.35.0"
  }
}
```

### **2. Jest Configuration**

```javascript
// jest.config.js
export default {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.ts"],
  moduleNameMapping: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/main.tsx",
    "!src/vite-env.d.ts",
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

### **3. MSW API Mocking Setup**

```typescript
// src/mocks/handlers.ts
import { rest } from "msw";

export const handlers = [
  // Users
  rest.get("/api/users", (req, res, ctx) => {
    return res(ctx.json(mockUsers));
  }),

  rest.post("/api/users", (req, res, ctx) => {
    const newUser = req.body;
    return res(ctx.json({ ...newUser, id: Date.now() }));
  }),

  // Topics
  rest.get("/api/topics", (req, res, ctx) => {
    return res(ctx.json(mockTopics));
  }),

  // Error scenarios
  rest.get("/api/users/error", (req, res, ctx) => {
    return res(ctx.status(500), ctx.json({ error: "Server error" }));
  }),
];
```

## 🎯 **Test Execution Plan**

### **Phase 1: Unit Tests**

```bash
# Run all unit tests
npm run test:unit

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

### **Phase 2: Integration Tests**

```bash
# Component integration
npm run test:integration

# API integration (requires backend)
npm run test:api-integration
```

### **Phase 3: E2E Tests**

```bash
# Start servers
npm run dev &
cd server && npm run dev &

# Run E2E tests
npm run test:e2e

# Run with UI
npm run test:e2e:ui
```

### **Phase 4: Manual Testing**

```bash
# Start development servers
npm run dev              # Frontend
cd server && npm run dev # Backend

# Test checklist:
# □ All forms work correctly
# □ Permission system enforced
# □ API integration functions
# □ Error handling works
# □ UI responsive on different screens
```

## 📋 **Test Verification Checklist**

### **✅ Functional Testing**

- [ ] All CRUD operations work (Create, Read, Update, Delete)
- [ ] Form validation prevents invalid data
- [ ] Permission system enforces access control
- [ ] API calls include correct headers and credentials
- [ ] Error messages display appropriately
- [ ] Loading states show during API calls
- [ ] Data refreshes after operations

### **✅ UI/UX Testing**

- [ ] Components render without errors
- [ ] Responsive design works on mobile/tablet/desktop
- [ ] Accessibility features work (keyboard nav, screen readers)
- [ ] Internationalization (i18n) displays correct languages
- [ ] Modal windows open/close properly
- [ ] Navigation between tabs works smoothly

### **✅ API Integration Testing**

- [ ] Mock data service works in development
- [ ] API data service connects to backend successfully
- [ ] Authentication tokens passed correctly
- [ ] API errors handled gracefully
- [ ] Data source switching works seamlessly
- [ ] Real-time updates reflect API changes

### **✅ Performance Testing**

- [ ] Initial page load < 3 seconds
- [ ] Component re-renders optimized
- [ ] Large data sets render efficiently
- [ ] Memory usage stays reasonable
- [ ] No memory leaks in long-running sessions

### **✅ Security Testing**

- [ ] Sensitive data not logged to console
- [ ] API credentials secure
- [ ] XSS protection in place
- [ ] Permission checks can't be bypassed client-side
- [ ] Admin features hidden from regular users

## 🔄 **Continuous Testing Strategy**

### **Development Workflow**

1. **Write tests first** (TDD approach)
2. **Run tests on file save** (watch mode)
3. **API integration tests** before merging
4. **E2E tests** for major features
5. **Manual testing** for UX validation

### **CI/CD Integration**

```yaml
# .github/workflows/test.yml
- name: Frontend Tests
  run: |
    npm ci
    npm run test:coverage
    npm run build
    npm run test:e2e:ci
```

This comprehensive test plan ensures the Study Group Platform frontend is robust, reliable, and ready for production use! 🚀
