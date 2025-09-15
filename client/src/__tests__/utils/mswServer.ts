// Mock Service Worker setup for API mocking
import { setupServer } from 'msw/node';
import { rest } from 'msw';
import type { User, Topic, Session, Interaction } from '../../types';

// Mock data
const mockUsers: User[] = [
  { id: 1, name: 'Test Admin', email: 'admin@test.com', role: 'admin', createdAt: '2024-01-01' },
  { id: 2, name: 'Test User', email: 'user@test.com', role: 'user', createdAt: '2024-01-02' }
];

const mockTopics: Topic[] = [
  {
    id: 1,
    title: 'Test Topic',
    startDate: '2024-03-01',
    endDate: '2024-05-31',
    intervalType: 'WEEKLY',
    outline: 'Test outline',
    referenceUrls: ['https://example.com'],
    keywords: ['test'],
    attendees: [1, 2],
    createdBy: 1,
    createdAt: '2024-01-01',
    sessions: []
  }
];

const mockSessions: Session[] = [
  {
    id: 1,
    topicId: 1,
    presenterId: 1,
    startDateTime: '2024-03-08 19:00',
    scope: 'Test Session',
    outline: 'Test session outline',
    noteLinks: [],
    references: [],
    attendees: [1, 2],
  }
];

// API handlers
const handlers = [
  // Authentication
  rest.post('/api/auth/login', (req, res, ctx) => {
    return res(ctx.json({
      user: mockUsers[0],
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token'
    }));
  }),

  rest.get('/api/auth/me', (req, res, ctx) => {
    return res(ctx.json(mockUsers[0]));
  }),

  // Users
  rest.get('/api/users', (req, res, ctx) => {
    return res(ctx.json(mockUsers));
  }),

  rest.post('/api/users', (req, res, ctx) => {
    const newUser = req.body as User;
    const user = { ...newUser, id: Date.now(), createdAt: new Date().toISOString() };
    return res(ctx.json(user));
  }),

  rest.put('/api/users/:id', (req, res, ctx) => {
    const id = parseInt(req.params.id as string);
    const updates = req.body as Partial<User>;
    const user = mockUsers.find(u => u.id === id);
    if (!user) return res(ctx.status(404), ctx.json({ error: 'User not found' }));
    return res(ctx.json({ ...user, ...updates }));
  }),

  rest.delete('/api/users/:id', (req, res, ctx) => {
    return res(ctx.json({ message: 'User deleted successfully' }));
  }),

  // Topics
  rest.get('/api/topics', (req, res, ctx) => {
    return res(ctx.json(mockTopics));
  }),

  rest.get('/api/topics/:id', (req, res, ctx) => {
    const id = parseInt(req.params.id as string);
    const topic = mockTopics.find(t => t.id === id);
    if (!topic) return res(ctx.status(404), ctx.json({ error: 'Topic not found' }));
    return res(ctx.json(topic));
  }),

  rest.post('/api/topics', (req, res, ctx) => {
    const newTopic = req.body as Topic;
    const topic = { ...newTopic, id: Date.now(), createdAt: new Date().toISOString(), sessions: [] };
    return res(ctx.json(topic));
  }),

  rest.put('/api/topics/:id', (req, res, ctx) => {
    const id = parseInt(req.params.id as string);
    const updates = req.body as Partial<Topic>;
    const topic = mockTopics.find(t => t.id === id);
    if (!topic) return res(ctx.status(404), ctx.json({ error: 'Topic not found' }));
    return res(ctx.json({ ...topic, ...updates }));
  }),

  rest.delete('/api/topics/:id', (req, res, ctx) => {
    return res(ctx.json({ message: 'Topic deleted successfully' }));
  }),

  // Sessions
  rest.get('/api/sessions', (req, res, ctx) => {
    return res(ctx.json(mockSessions));
  }),

  rest.get('/api/sessions/:id', (req, res, ctx) => {
    const id = parseInt(req.params.id as string);
    const session = mockSessions.find(s => s.id === id);
    if (!session) return res(ctx.status(404), ctx.json({ error: 'Session not found' }));
    return res(ctx.json(session));
  }),

  rest.post('/api/sessions', (req, res, ctx) => {
    const newSession = req.body;
    return res(ctx.json({ ...newSession, id: Date.now() }));
  }),

  rest.put('/api/sessions/:id', (req, res, ctx) => {
    const id = parseInt(req.params.id as string);
    const updates = req.body;
    const session = mockSessions.find(s => s.id === id);
    if (!session) return res(ctx.status(404), ctx.json({ error: 'Session not found' }));
    return res(ctx.json({ ...session, ...updates }));
  }),

  rest.delete('/api/sessions/:id', (req, res, ctx) => {
    return res(ctx.json({ message: 'Session deleted successfully' }));
  }),

  // Interactions
  rest.get('/api/interactions', (req, res, ctx) => {
    return res(ctx.json([]));
  }),

  rest.post('/api/interactions', (req, res, ctx) => {
    const newInteraction = req.body;
    return res(ctx.json({ ...newInteraction, id: Date.now() }));
  }),

  rest.put('/api/interactions/:id', (req, res, ctx) => {
    const id = parseInt(req.params.id as string);
    const updates = req.body;
    return res(ctx.json({ id, ...updates }));
  }),

  rest.delete('/api/interactions/:id', (req, res, ctx) => {
    return res(ctx.json({ message: 'Interaction deleted successfully' }));
  }),

  // Error handlers
  rest.get('/api/error-test', (req, res, ctx) => {
    return res(ctx.status(500), ctx.json({ error: 'Server error' }));
  }),

  rest.post('/api/auth/login-fail', (req, res, ctx) => {
    return res(ctx.status(401), ctx.json({ error: 'Invalid credentials' }));
  })
];

export const server = setupServer(...handlers);