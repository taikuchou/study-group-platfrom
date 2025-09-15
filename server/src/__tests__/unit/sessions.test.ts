import request from 'supertest';
import app from '../../app';
import { prisma } from '../utils/setup';
import { TestHelpers } from '../utils/testHelpers';

describe('Session Management Service', () => {
  let testHelpers: TestHelpers;

  beforeAll(() => {
    testHelpers = new TestHelpers(prisma);
  });

  describe('GET /api/sessions', () => {
    it('should return list of sessions for authenticated user', async () => {
      const user = await testHelpers.createTestUser();
      const topic = await testHelpers.createTestTopic(user.id);
      const session = await testHelpers.createTestSession(topic.id, user.id);

      const response = await request(app)
        .get('/api/sessions')
        .set('Authorization', `Bearer ${user.accessToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(1);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('scope');
      expect(response.body[0]).toHaveProperty('attendees');
    });

    it('should reject unauthenticated request', async () => {
      const response = await request(app)
        .get('/api/sessions')
        .expect(401);

      expect(response.body.error).toBe('No token provided');
    });
  });

  describe('POST /api/sessions', () => {
    it('should allow admin to create new session', async () => {
      const admin = await testHelpers.createTestAdmin();
      const user = await testHelpers.createTestUser();
      const topic = await testHelpers.createTestTopic(admin.id);

      const sessionData = {
        topicId: topic.id,
        presenterId: user.id,
        startDateTime: '2024-03-15 19:00',
        scope: 'Test Session',
        outline: 'Test session outline',
        noteLinks: ['https://example.com/notes'],
        references: ['Reference 1'],
      };

      const response = await request(app)
        .post('/api/sessions')
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .send(sessionData)
        .expect(201);

      expect(response.body.scope).toBe(sessionData.scope);
      expect(response.body.topicId).toBe(sessionData.topicId);
      expect(response.body.presenterId).toBe(sessionData.presenterId);
    });

    it('should reject non-admin from creating session', async () => {
      const user = await testHelpers.createTestUser();
      const topic = await testHelpers.createTestTopic(user.id);

      const sessionData = {
        topicId: topic.id,
        presenterId: user.id,
        startDateTime: '2024-03-15 19:00',
        scope: 'Test Session',
      };

      const response = await request(app)
        .post('/api/sessions')
        .set('Authorization', `Bearer ${user.accessToken}`)
        .send(sessionData)
        .expect(403);

      expect(response.body.error).toBe('Insufficient permissions');
    });

    it('should reject session with non-existent topic', async () => {
      const admin = await testHelpers.createTestAdmin();
      const user = await testHelpers.createTestUser();

      const sessionData = {
        topicId: 99999,
        presenterId: user.id,
        startDateTime: '2024-03-15 19:00',
        scope: 'Test Session',
      };

      const response = await request(app)
        .post('/api/sessions')
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .send(sessionData)
        .expect(404);

      expect(response.body.error).toBe('Topic not found');
    });

    it('should reject session with non-existent presenter', async () => {
      const admin = await testHelpers.createTestAdmin();
      const topic = await testHelpers.createTestTopic(admin.id);

      const sessionData = {
        topicId: topic.id,
        presenterId: 99999,
        startDateTime: '2024-03-15 19:00',
        scope: 'Test Session',
      };

      const response = await request(app)
        .post('/api/sessions')
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .send(sessionData)
        .expect(404);

      expect(response.body.error).toBe('Presenter not found');
    });

    it('should reject invalid session data', async () => {
      const admin = await testHelpers.createTestAdmin();
      const topic = await testHelpers.createTestTopic(admin.id);

      const invalidSessionData = {
        topicId: topic.id,
        presenterId: admin.id,
        startDateTime: 'invalid-datetime',
        scope: 'A', // Too short
      };

      const response = await request(app)
        .post('/api/sessions')
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .send(invalidSessionData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/sessions/:id', () => {
    it('should return session details for authorized user', async () => {
      const user = await testHelpers.createTestUser();
      const topic = await testHelpers.createTestTopic(user.id);
      const session = await testHelpers.createTestSession(topic.id, user.id);

      const response = await request(app)
        .get(`/api/sessions/${session.id}`)
        .set('Authorization', `Bearer ${user.accessToken}`)
        .expect(200);

      expect(response.body.id).toBe(session.id);
      expect(response.body.scope).toBe(session.scope);
      expect(response.body.presenterId).toBe(user.id);
    });

    it('should return 404 for non-existent session', async () => {
      const user = await testHelpers.createTestUser();

      const response = await request(app)
        .get('/api/sessions/99999')
        .set('Authorization', `Bearer ${user.accessToken}`)
        .expect(404);

      expect(response.body.error).toBe('session not found');
    });
  });

  describe('PUT /api/sessions/:id', () => {
    it('should allow presenter to update session', async () => {
      const presenter = await testHelpers.createTestUser();
      const topic = await testHelpers.createTestTopic(presenter.id);
      const session = await testHelpers.createTestSession(topic.id, presenter.id);

      const updateData = {
        scope: 'Updated Session Scope',
        outline: 'Updated outline',
      };

      const response = await request(app)
        .put(`/api/sessions/${session.id}`)
        .set('Authorization', `Bearer ${presenter.accessToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.scope).toBe(updateData.scope);
      expect(response.body.outline).toBe(updateData.outline);
    });

    it('should allow admin to update any session', async () => {
      const presenter = await testHelpers.createTestUser();
      const admin = await testHelpers.createTestAdmin();
      const topic = await testHelpers.createTestTopic(presenter.id);
      const session = await testHelpers.createTestSession(topic.id, presenter.id);

      const updateData = { scope: 'Admin Updated Scope' };

      const response = await request(app)
        .put(`/api/sessions/${session.id}`)
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.scope).toBe(updateData.scope);
    });

    it('should reject non-presenter/non-admin from updating session', async () => {
      const presenter = await testHelpers.createTestUser();
      const otherUser = await testHelpers.createTestUser();
      const topic = await testHelpers.createTestTopic(presenter.id);
      const session = await testHelpers.createTestSession(topic.id, presenter.id);

      const updateData = { scope: 'Unauthorized Update' };

      const response = await request(app)
        .put(`/api/sessions/${session.id}`)
        .set('Authorization', `Bearer ${otherUser.accessToken}`)
        .send(updateData)
        .expect(403);

      expect(response.body.error).toBe('Insufficient permissions');
    });
  });

  describe('DELETE /api/sessions/:id', () => {
    it('should allow presenter to delete session', async () => {
      const presenter = await testHelpers.createTestUser();
      const topic = await testHelpers.createTestTopic(presenter.id);
      const session = await testHelpers.createTestSession(topic.id, presenter.id);

      const response = await request(app)
        .delete(`/api/sessions/${session.id}`)
        .set('Authorization', `Bearer ${presenter.accessToken}`)
        .expect(200);

      expect(response.body.message).toBe('Session deleted successfully');

      // Verify session is deleted
      const deletedSession = await prisma.session.findUnique({
        where: { id: session.id },
      });
      expect(deletedSession).toBeNull();
    });

    it('should allow admin to delete any session', async () => {
      const presenter = await testHelpers.createTestUser();
      const admin = await testHelpers.createTestAdmin();
      const topic = await testHelpers.createTestTopic(presenter.id);
      const session = await testHelpers.createTestSession(topic.id, presenter.id);

      const response = await request(app)
        .delete(`/api/sessions/${session.id}`)
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .expect(200);

      expect(response.body.message).toBe('Session deleted successfully');
    });

    it('should reject non-presenter/non-admin from deleting session', async () => {
      const presenter = await testHelpers.createTestUser();
      const otherUser = await testHelpers.createTestUser();
      const topic = await testHelpers.createTestTopic(presenter.id);
      const session = await testHelpers.createTestSession(topic.id, presenter.id);

      const response = await request(app)
        .delete(`/api/sessions/${session.id}`)
        .set('Authorization', `Bearer ${otherUser.accessToken}`)
        .expect(403);

      expect(response.body.error).toBe('Insufficient permissions');
    });
  });

  describe('GET /api/topics/:id/sessions', () => {
    it('should return sessions for specific topic', async () => {
      const user = await testHelpers.createTestUser();
      const topic = await testHelpers.createTestTopic(user.id);
      const session1 = await testHelpers.createTestSession(topic.id, user.id, { scope: 'Session 1' });
      const session2 = await testHelpers.createTestSession(topic.id, user.id, { scope: 'Session 2' });

      const response = await request(app)
        .get(`/api/topics/${topic.id}/sessions`)
        .set('Authorization', `Bearer ${user.accessToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      expect(response.body.some((s: any) => s.scope === 'Session 1')).toBe(true);
      expect(response.body.some((s: any) => s.scope === 'Session 2')).toBe(true);
    });

    it('should return empty array for topic with no sessions', async () => {
      const user = await testHelpers.createTestUser();
      const topic = await testHelpers.createTestTopic(user.id);

      const response = await request(app)
        .get(`/api/topics/${topic.id}/sessions`)
        .set('Authorization', `Bearer ${user.accessToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });
  });
});