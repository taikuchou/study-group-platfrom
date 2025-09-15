# Study Group Platform - Complete Function & API Mapping

Comprehensive mapping of all frontend functions to their corresponding backend APIs and test verification requirements.

## 🗺️ **Architecture Overview**

```
Frontend Functions → Backend APIs → Database Operations
     ↓                    ↓                    ↓
  Components         REST Endpoints       PostgreSQL
     ↓                    ↓                    ↓
  Test Cases         API Tests           DB Tests
```

## 🔍 **Complete Function Inventory**

### **🏗️ Core Application Functions**

#### **1. Main Application (`StudyGroupPlatform.tsx`)**

| Function | Type | Purpose | State Updated | Test Priority |
|----------|------|---------|--------------|---------------|
| `setActiveTab(tab)` | State Setter | Switch between Topics/Sessions/Users | `activeTab` | **HIGH** |
| `setSelectedTopic(topic)` | State Setter | Select topic for detailed view | `selectedTopic` | **HIGH** |
| `setSelectedSession(session)` | State Setter | Select session for detailed view | `selectedSession` | **HIGH** |
| `setSearchQuery(query)` | State Setter | Update search filter | `searchQuery` | **MEDIUM** |
| `toggleTopicExpansion(id)` | State Function | Expand/collapse topic details | `expandedTopicIds` | **MEDIUM** |
| `openTopicForm(topic?)` | State Function | Open create/edit topic modal | `showTopicForm`, `editingTopic` | **HIGH** |
| `openSessionForm(session?, topic?)` | State Function | Open create/edit session modal | `showSessionForm`, `editingSession` | **HIGH** |
| `openUserForm(user?)` | State Function | Open create/edit user modal | `showUserForm`, `editingUser` | **HIGH** |
| `openInteractionForm(interaction?, type?)` | State Function | Open create/edit interaction modal | `showInteractionForm`, `editingInteraction` | **HIGH** |
| `closeAllModals()` | State Function | Close all open modals | All modal states | **HIGH** |
| `handleUserSwitch(user)` | State Function | Switch current user context | `currentUser` | **HIGH** |
| `handleLanguageSwitch(lang)` | State Function | Switch UI language | Language context | **MEDIUM** |

#### **2. Data Context Functions (`DataContext.tsx`)**

| Function | Return Type | API Endpoint | HTTP Method | Permissions | Test Priority |
|----------|-------------|--------------|-------------|-------------|---------------|
| **User Management** |||||
| `reload()` | `Promise<void>` | Multiple endpoints | GET | Any authenticated | **HIGH** |
| `createUser(user)` | `Promise<User>` | `/api/users` | POST | Admin only | **HIGH** |
| `updateUser(user)` | `Promise<User>` | `/api/users/:id` | PUT | Self or Admin | **HIGH** |
| `deleteUser(id)` | `Promise<void>` | `/api/users/:id` | DELETE | Admin only | **HIGH** |
| **Topic Management** |||||
| `createTopic(topic)` | `Promise<Topic>` | `/api/topics` | POST | Any authenticated | **HIGH** |
| `updateTopic(topic)` | `Promise<Topic>` | `/api/topics/:id` | PUT | Creator or Admin | **HIGH** |
| `deleteTopic(id)` | `Promise<void>` | `/api/topics/:id` | DELETE | Creator or Admin | **HIGH** |
| `joinTopic(id)` | `Promise<void>` | `/api/topics/:id/join` | POST | Any authenticated | **HIGH** |
| `leaveTopic(id)` | `Promise<void>` | `/api/topics/:id/leave` | DELETE | Any authenticated | **HIGH** |
| **Session Management** |||||
| `createSession(session)` | `Promise<Session>` | `/api/sessions` | POST | Admin only | **HIGH** |
| `updateSession(session)` | `Promise<Session>` | `/api/sessions/:id` | PUT | Presenter or Admin | **HIGH** |
| `deleteSession(id)` | `Promise<void>` | `/api/sessions/:id` | DELETE | Presenter or Admin | **HIGH** |
| **Interaction Management** |||||
| `createInteraction(interaction)` | `Promise<Interaction>` | `/api/interactions` | POST | Any authenticated | **HIGH** |
| `updateInteraction(interaction)` | `Promise<Interaction>` | `/api/interactions/:id` | PUT | Author or Admin | **HIGH** |
| `deleteInteraction(id)` | `Promise<void>` | `/api/interactions/:id` | DELETE | Admin only | **HIGH** |
| **Permission Functions** |||||
| `can(action, resource)` | `boolean` | None (client-side) | N/A | N/A | **HIGH** |
| `OwnershipGuard(props)` | `JSX.Element` | None (client-side) | N/A | N/A | **HIGH** |

#### **3. Service Layer Functions**

##### **ApiDataService.ts**
| Function | API Endpoint | Headers Required | Error Handling | Test Cases |
|----------|--------------|------------------|----------------|------------|
| `listUsers()` | `GET /api/users` | `credentials: include` | 401, 403, 500 | Admin access, unauthorized |
| `createUser(user)` | `POST /api/users` | `Content-Type: application/json` | 400, 409, 500 | Valid data, duplicates, validation |
| `updateUser(user)` | `PUT /api/users/:id` | `Content-Type: application/json` | 400, 404, 403 | Valid updates, not found, permissions |
| `deleteUser(id)` | `DELETE /api/users/:id` | `credentials: include` | 404, 403, 500 | Successful delete, not found, permissions |
| `listTopics()` | `GET /api/topics` | `credentials: include` | 401, 500 | Data retrieval, unauthorized |
| `getTopic(id)` | `GET /api/topics/:id` | `credentials: include` | 404, 401 | Valid topic, not found |
| `createTopic(topic)` | `POST /api/topics` | `Content-Type: application/json` | 400, 401 | Valid topic, validation errors |
| `updateTopic(topic)` | `PUT /api/topics/:id` | `Content-Type: application/json` | 400, 404, 403 | Valid updates, permissions |
| `deleteTopic(id)` | `DELETE /api/topics/:id` | `credentials: include` | 404, 403 | Successful delete, permissions |
| `listSessions()` | `GET /api/sessions` | `credentials: include` | 401, 500 | Data retrieval, unauthorized |
| `getSession(id)` | `GET /api/sessions/:id` | `credentials: include` | 404, 401 | Valid session, not found |
| `createSession(session)` | `POST /api/sessions` | `Content-Type: application/json` | 400, 401, 403 | Valid session, validation, admin only |
| `updateSession(session)` | `PUT /api/sessions/:id` | `Content-Type: application/json` | 400, 404, 403 | Valid updates, presenter/admin only |
| `deleteSession(id)` | `DELETE /api/sessions/:id` | `credentials: include` | 404, 403 | Successful delete, presenter/admin only |
| `listInteractions()` | `GET /api/interactions` | `credentials: include` | 401, 500 | Data retrieval |
| `createInteraction(i)` | `POST /api/interactions` | `Content-Type: application/json` | 400, 401 | Valid interaction, validation |
| `updateInteraction(i)` | `PUT /api/interactions/:id` | `Content-Type: application/json` | 400, 404, 403 | Valid updates, permissions |
| `deleteInteraction(id)` | `DELETE /api/interactions/:id` | `credentials: include` | 404, 403 | Admin delete only |

##### **MockDataService.ts**
| Function | Data Source | Persistence | Test Cases |
|----------|------------|-------------|------------|
| User CRUD operations | `mockUsers` array | Session only | Data consistency, state management |
| Topic CRUD operations | `mockTopics` array | Session only | Data consistency, embedded sessions |
| Session CRUD operations | `mockSessions` array | Session only | Data consistency, topic association |
| Interaction CRUD operations | `mockInteractions` array | Session only | Data consistency, session association |

#### **4. Permission System Functions (`Ownership.ts`)**

| Function | Parameters | Return | Logic | Test Cases |
|----------|------------|--------|--------|------------|
| `canPerform(user, action, resource?)` | User, Action, Resource | boolean | Admin bypass, ownership check | Admin permissions, ownership, anonymous |
| `canPerformSessionAction(user, action, session)` | User, Action, Session | boolean | Presenter permissions | Presenter edit/delete, admin override |
| `canPerformInteractionAction(user, action, interaction)` | User, Action, Interaction | boolean | Author edit, admin delete | Author permissions, admin delete |

### **🎨 Feature Component Functions**

#### **5. Topic Management**

##### **TopicList.tsx**
| Function | Purpose | API Dependency | Test Cases |
|----------|---------|----------------|------------|
| `filterTopics(query)` | Search/filter topics | `listTopics()` | Search functionality, filter results |
| `handleTopicSelect(topic)` | Select topic for detail view | None | Selection state management |
| `handleTopicEdit(topic)` | Open edit modal | None | Modal state, form population |
| `handleTopicDelete(id)` | Delete topic with confirmation | `deleteTopic(id)` | Confirmation dialog, API call |

##### **TopicForm.tsx**
| Function | Purpose | Validation | API Call | Test Cases |
|----------|---------|------------|----------|------------|
| `handleSubmit(formData)` | Create/update topic | Client-side validation | `createTopic()` or `updateTopic()` | Form validation, API integration |
| `addReferenceUrl()` | Add URL field | URL validation | None | Dynamic form fields |
| `removeReferenceUrl(index)` | Remove URL field | None | None | Dynamic form fields |
| `addKeyword()` | Add keyword field | None | None | Dynamic form fields |
| `removeKeyword(index)` | Remove keyword field | None | None | Dynamic form fields |
| `handleAttendeesChange(attendees)` | Update attendees | User existence | None | Multi-select functionality |

#### **6. Session Management**

##### **SessionDetail.tsx**
| Function | Purpose | API Dependency | Test Cases |
|----------|---------|----------------|------------|
| `loadSessionInteractions(id)` | Load session interactions | `GET /api/sessions/:id/interactions` | Data loading, error handling |
| `handleInteractionCreate(interaction)` | Create new interaction | `createInteraction()` | Form submission, API integration |
| `handleInteractionEdit(interaction)` | Edit existing interaction | `updateInteraction()` | Permission check, form population |
| `handleInteractionDelete(id)` | Delete interaction | `deleteInteraction()` | Admin-only, confirmation |

##### **SessionForm.tsx**
| Function | Purpose | Validation | API Call | Test Cases |
|----------|---------|------------|----------|------------|
| `handleSubmit(formData)` | Create/update session | Date/time validation | `createSession()` or `updateSession()` | Form validation, API integration |
| `validateDateTime(dateTime)` | Validate session time | Future date check | None | Date validation logic |
| `handlePresenterSelect(presenter)` | Select session presenter | User validation | None | Presenter selection |

#### **7. User Management**

##### **UserManagement.tsx**
| Function | Purpose | Permission Required | API Call | Test Cases |
|----------|---------|-------------------|----------|------------|
| `loadUsers()` | Load all users | Admin only | `listUsers()` | Admin access, data display |
| `handleUserCreate(user)` | Create new user | Admin only | `createUser()` | Admin-only access, form validation |
| `handleUserEdit(user)` | Edit user info | Admin or self | `updateUser()` | Permission validation, form population |
| `handleUserDelete(id)` | Delete user | Admin only | `deleteUser()` | Admin-only, confirmation dialog |
| `handleRoleChange(id, role)` | Change user role | Admin only | `updateUser()` | Admin-only, role validation |

##### **UserForm.tsx**
| Function | Purpose | Validation | Test Cases |
|----------|---------|------------|------------|
| `handleSubmit(formData)` | Create/update user | Email validation, required fields | Form validation, API integration |
| `validateEmail(email)` | Email format validation | Email regex | Email validation logic |
| `handleRoleSelect(role)` | Select user role | Admin permission check | Role selection logic |

#### **8. Interaction Management**

##### **InteractionForm.tsx**
| Function | Purpose | Validation | API Call | Test Cases |
|----------|---------|------------|----------|------------|
| `handleSubmit(formData)` | Create/update interaction | Type-specific validation | `createInteraction()` or `updateInteraction()` | All interaction types, validation |
| `handleTypeChange(type)` | Change interaction type | None | None | Form field changes |
| `validateNoteLink(data)` | Validate note link fields | URL validation, required fields | None | Note link validation |
| `validateQuestion(data)` | Validate question content | Required content | None | Question validation |

#### **9. Custom Hooks**

##### **useTopics.ts**
| Hook Function | Purpose | API Dependency | Return Value |
|---------------|---------|----------------|--------------|
| `useTopics()` | Topic CRUD operations | DataContext | `{ topics, createTopic, updateTopic, deleteTopic, loading, error }` |
| `useTopicDetail(id)` | Single topic with sessions | `getTopic(id)` | `{ topic, sessions, loading, error }` |

##### **useSessions.ts**
| Hook Function | Purpose | API Dependency | Return Value |
|---------------|---------|----------------|--------------|
| `useSessions()` | Session CRUD operations | DataContext | `{ sessions, createSession, updateSession, deleteSession, loading, error }` |

##### **useUsers.ts**
| Hook Function | Purpose | API Dependency | Return Value |
|---------------|---------|----------------|--------------|
| `useUsers()` | User CRUD operations | DataContext | `{ users, createUser, updateUser, deleteUser, loading, error }` |

##### **useInteractions.ts**
| Hook Function | Purpose | API Dependency | Return Value |
|---------------|---------|----------------|--------------|
| `useInteractions()` | Interaction CRUD operations | DataContext | `{ interactions, createInteraction, updateInteraction, deleteInteraction, loading, error }` |

## 🔗 **API Integration Matrix**

### **Complete API Mapping**

| Frontend Function | HTTP Method | API Endpoint | Request Body | Response | Error Codes | Auth Required |
|------------------|-------------|--------------|--------------|----------|-------------|---------------|
| **Authentication** |||||||
| User login | POST | `/api/auth/login` | `{email, password}` | `{user, accessToken, refreshToken}` | 400, 401 | No |
| User logout | POST | `/api/auth/logout` | `{}` | `{message}` | 401 | Yes |
| Get current user | GET | `/api/auth/me` | None | `User` | 401, 404 | Yes |
| Refresh token | POST | `/api/auth/refresh` | `{refreshToken}` | `{accessToken, refreshToken}` | 400, 401 | No |
| **User Management** |||||||
| `listUsers()` | GET | `/api/users` | None | `User[]` | 401, 403 | Yes (Admin) |
| `createUser(user)` | POST | `/api/users` | `User` | `User` | 400, 401, 403, 409 | Yes (Admin) |
| `updateUser(user)` | PUT | `/api/users/:id` | `User` | `User` | 400, 401, 403, 404 | Yes (Self/Admin) |
| `deleteUser(id)` | DELETE | `/api/users/:id` | None | `{message}` | 401, 403, 404 | Yes (Admin) |
| **Topic Management** |||||||
| `listTopics()` | GET | `/api/topics` | None | `Topic[]` | 401 | Yes |
| `getTopic(id)` | GET | `/api/topics/:id` | None | `Topic` | 401, 404 | Yes |
| `createTopic(topic)` | POST | `/api/topics` | `Topic` | `Topic` | 400, 401 | Yes |
| `updateTopic(topic)` | PUT | `/api/topics/:id` | `Topic` | `Topic` | 400, 401, 403, 404 | Yes (Creator/Admin) |
| `deleteTopic(id)` | DELETE | `/api/topics/:id` | None | `{message}` | 401, 403, 404 | Yes (Creator/Admin) |
| Join topic | POST | `/api/topics/:id/join` | None | `{message}` | 400, 401, 404 | Yes |
| Leave topic | DELETE | `/api/topics/:id/leave` | None | `{message}` | 401, 404 | Yes |
| **Session Management** |||||||
| List sessions | GET | `/api/sessions` | None | `Session[]` | 401 | Yes |
| Get session | GET | `/api/sessions/:id` | None | `Session` | 401, 404 | Yes |
| `createSession(session)` | POST | `/api/sessions` | `Session` | `Session` | 400, 401, 403 | Yes (Admin) |
| `updateSession(session)` | PUT | `/api/sessions/:id` | `Session` | `Session` | 400, 401, 403, 404 | Yes (Presenter/Admin) |
| Delete session | DELETE | `/api/sessions/:id` | None | `{message}` | 401, 403, 404 | Yes (Presenter/Admin) |
| Get topic sessions | GET | `/api/topics/:id/sessions` | None | `Session[]` | 401, 404 | Yes |
| **Interaction Management** |||||||
| `listInteractions()` | GET | `/api/interactions` | None | `Interaction[]` | 401 | Yes |
| Get interaction | GET | `/api/interactions/:id` | None | `Interaction` | 401, 404 | Yes |
| `createInteraction(i)` | POST | `/api/interactions` | `Interaction` | `Interaction` | 400, 401 | Yes |
| `updateInteraction(i)` | PUT | `/api/interactions/:id` | `Interaction` | `Interaction` | 400, 401, 403, 404 | Yes (Author/Admin) |
| `deleteInteraction(id)` | DELETE | `/api/interactions/:id` | None | `{message}` | 401, 403, 404 | Yes (Admin) |
| Get session interactions | GET | `/api/sessions/:id/interactions` | None | `Interaction[]` | 401, 404 | Yes |

## 🧪 **Test Verification Requirements**

### **Function-Level Test Cases**

#### **1. State Management Functions**
```typescript
describe('State Management', () => {
  test('setActiveTab updates activeTab state', () => {
    // Setup: Initial state
    // Action: Call setActiveTab('users')
    // Assert: activeTab === 'users'
  });
  
  test('openTopicForm sets modal state correctly', () => {
    // Setup: Closed modal
    // Action: Call openTopicForm(mockTopic)
    // Assert: showTopicForm === true, editingTopic === mockTopic
  });
});
```

#### **2. API Integration Functions**
```typescript
describe('API Integration', () => {
  test('createUser calls correct API endpoint', async () => {
    // Setup: Mock fetch, user data
    // Action: Call createUser(userData)
    // Assert: fetch called with POST /api/users
  });
  
  test('createUser handles API errors', async () => {
    // Setup: Mock 400 response
    // Action: Call createUser with invalid data
    // Assert: Error thrown/handled appropriately
  });
});
```

#### **3. Permission Functions**
```typescript
describe('Permission System', () => {
  test('can() returns true for admin users', () => {
    // Setup: Admin user
    // Action: Check various permissions
    // Assert: All return true
  });
  
  test('can() checks ownership for regular users', () => {
    // Setup: User, owned resource
    // Action: Check edit permission
    // Assert: Returns true for owned, false for others
  });
});
```

### **Component Integration Test Cases**

#### **1. Form to API Integration**
```typescript
describe('Form Integration', () => {
  test('TopicForm submission calls createTopic API', async () => {
    // Setup: Render TopicForm, fill form
    // Action: Submit form
    // Assert: createTopic called, API endpoint hit
  });
  
  test('UserForm shows validation errors', async () => {
    // Setup: Render UserForm
    // Action: Submit empty form
    // Assert: Validation messages displayed
  });
});
```

#### **2. Permission-Based Rendering**
```typescript
describe('Permission-Based UI', () => {
  test('UserManagement hidden for non-admin users', () => {
    // Setup: Regular user context
    // Action: Render app
    // Assert: UserManagement not accessible
  });
  
  test('Admin features shown for admin users', () => {
    // Setup: Admin user context
    // Action: Render app
    // Assert: All admin features accessible
  });
});
```

## 📊 **Coverage Requirements**

### **Function Coverage Targets**
- **Critical Functions (Auth, CRUD)**: 100% coverage
- **UI State Management**: 95% coverage  
- **Permission System**: 100% coverage
- **Form Validation**: 90% coverage
- **Error Handling**: 85% coverage

### **API Integration Coverage**
- **All CRUD endpoints**: 100% tested
- **Authentication flows**: 100% tested
- **Permission validation**: 100% tested
- **Error scenarios**: 90% tested
- **Edge cases**: 80% tested

### **Component Coverage**
- **Critical components**: 95% coverage
- **Form components**: 90% coverage
- **Display components**: 85% coverage
- **Utility components**: 80% coverage

This comprehensive mapping ensures every frontend function is properly tested and verified against its corresponding backend API! 🚀