import request from 'supertest';
import app from '../../app';
import { prisma } from '../utils/setup';
import { TestHelpers } from '../utils/testHelpers';

describe('API Integration Tests', () => {
  let testHelpers: TestHelpers;

  beforeAll(() => {
    testHelpers = new TestHelpers(prisma);
  });

  describe('Complete User Journey', () => {
    it('should complete full study group workflow', async () => {
      // 1. Register two users
      const userData1 = {
        name: 'Alice Smith',
        email: 'alice.integration@example.com',
        password: 'password123',
      };

      const userData2 = {
        name: 'Bob Johnson',
        email: 'bob.integration@example.com',
        password: 'password123',
      };

      const registerResponse1 = await request(app)
        .post('/api/auth/register')
        .send(userData1)
        .expect(201);

      const registerResponse2 = await request(app)
        .post('/api/auth/register')
        .send(userData2)
        .expect(201);

      const alice = registerResponse1.body;
      const bob = registerResponse2.body;

      // 2. Alice creates a topic
      const topicData = {
        title: 'Integration Test Topic',
        startDate: '2024-04-01',
        endDate: '2024-06-30',
        intervalType: 'WEEKLY',
        outline: 'A comprehensive integration test topic',
        referenceUrls: ['https://example.com/docs'],
        keywords: ['integration', 'testing', 'api'],
      };

      const topicResponse = await request(app)
        .post('/api/topics')
        .set('Authorization', `Bearer ${alice.accessToken}`)
        .send(topicData)
        .expect(201);

      const topic = topicResponse.body;
      expect(topic.createdBy).toBe(alice.user.id);
      expect(topic.attendees).toContain(alice.user.id);

      // 3. Bob joins the topic
      await request(app)
        .post(`/api/topics/${topic.id}/join`)
        .set('Authorization', `Bearer ${bob.accessToken}`)
        .expect(200);

      // 4. Verify Bob is now an attendee
      const updatedTopicResponse = await request(app)
        .get(`/api/topics/${topic.id}`)
        .set('Authorization', `Bearer ${alice.accessToken}`)
        .expect(200);

      expect(updatedTopicResponse.body.attendees).toContain(bob.user.id);

      // 5. Create admin user for session creation
      const admin = await testHelpers.createTestAdmin();

      // 6. Admin creates a session for the topic
      const sessionData = {
        topicId: topic.id,
        presenterId: alice.user.id,
        startDateTime: '2024-04-08 19:00',
        scope: 'Introduction to Integration Testing',
        outline: 'We will cover the basics of integration testing',
        noteLinks: [],
        references: [],
      };

      const sessionResponse = await request(app)
        .post('/api/sessions')
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .send(sessionData)
        .expect(201);

      const session = sessionResponse.body;
      expect(session.presenterId).toBe(alice.user.id);
      expect(session.topicId).toBe(topic.id);

      // 7. Bob asks a question during the session
      const questionData = {
        type: 'question',
        sessionId: session.id,
        content: 'What are the best practices for integration testing?',
      };

      const questionResponse = await request(app)
        .post('/api/interactions')
        .set('Authorization', `Bearer ${bob.accessToken}`)
        .send(questionData)
        .expect(201);

      expect(questionResponse.body.authorId).toBe(bob.user.id);
      expect(questionResponse.body.sessionId).toBe(session.id);

      // 8. Alice shares a reference link
      const noteLinkData = {
        type: 'noteLink',
        sessionId: session.id,
        label: 'Testing Best Practices',
        description: 'Comprehensive guide to testing',
        url: 'https://testing-best-practices.example.com',
      };

      const noteLinkResponse = await request(app)
        .post('/api/interactions')
        .set('Authorization', `Bearer ${alice.accessToken}`)
        .send(noteLinkData)
        .expect(201);

      expect(noteLinkResponse.body.type).toBe('noteLink');
      expect(noteLinkResponse.body.authorId).toBe(alice.user.id);

      // 9. Bob provides weekly insight
      const insightData = {
        type: 'weeklyInsight',
        sessionId: session.id,
        content: 'I learned that integration tests should focus on the interfaces between components.',
      };

      const insightResponse = await request(app)
        .post('/api/interactions')
        .set('Authorization', `Bearer ${bob.accessToken}`)
        .send(insightData)
        .expect(201);

      expect(insightResponse.body.type).toBe('weeklyInsight');

      // 10. Verify all interactions for the session
      const interactionsResponse = await request(app)
        .get(`/api/sessions/${session.id}/interactions`)
        .set('Authorization', `Bearer ${alice.accessToken}`)
        .expect(200);

      expect(interactionsResponse.body.length).toBe(3);
      
      const interactionTypes = interactionsResponse.body.map((i: any) => i.type);
      expect(interactionTypes).toContain('question');
      expect(interactionTypes).toContain('noteLink');
      expect(interactionTypes).toContain('weeklyInsight');

      // 11. Alice updates the session outline
      const sessionUpdate = {
        outline: 'Updated outline: We covered integration testing basics and Q&A',
      };

      const updatedSessionResponse = await request(app)
        .put(`/api/sessions/${session.id}`)
        .set('Authorization', `Bearer ${alice.accessToken}`)
        .send(sessionUpdate)
        .expect(200);

      expect(updatedSessionResponse.body.outline).toBe(sessionUpdate.outline);

      // 12. Verify complete topic structure
      const finalTopicResponse = await request(app)
        .get(`/api/topics/${topic.id}`)
        .set('Authorization', `Bearer ${alice.accessToken}`)
        .expect(200);

      const finalTopic = finalTopicResponse.body;
      expect(finalTopic.sessions.length).toBe(1);
      expect(finalTopic.attendees.length).toBe(2); // Alice and Bob
      expect(finalTopic.sessions[0].outline).toBe(sessionUpdate.outline);
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle cascading permission errors', async () => {
      const user1 = await testHelpers.createTestUser();
      const user2 = await testHelpers.createTestUser();
      const topic = await testHelpers.createTestTopic(user1.id);

      // User2 tries to update User1's topic
      const response1 = await request(app)
        .put(`/api/topics/${topic.id}`)
        .set('Authorization', `Bearer ${user2.accessToken}`)
        .send({ title: 'Hacked Title' })
        .expect(403);

      expect(response1.body.error).toBe('Insufficient permissions');

      // User2 tries to delete User1's topic
      const response2 = await request(app)
        .delete(`/api/topics/${topic.id}`)
        .set('Authorization', `Bearer ${user2.accessToken}`)
        .expect(403);

      expect(response2.body.error).toBe('Insufficient permissions');

      // Verify topic is unchanged
      const topicResponse = await request(app)
        .get(`/api/topics/${topic.id}`)
        .set('Authorization', `Bearer ${user1.accessToken}`)
        .expect(200);

      expect(topicResponse.body.createdBy).toBe(user1.id);
    });

    it('should handle resource dependency chains', async () => {
      const user = await testHelpers.createTestUser();
      const admin = await testHelpers.createTestAdmin();

      // Create topic -> session -> interaction chain
      const topic = await testHelpers.createTestTopic(user.id);
      const session = await testHelpers.createTestSession(topic.id, user.id);
      const interaction = await testHelpers.createTestInteraction(session.id, user.id);

      // Admin deletes the topic (should cascade delete session and interaction)
      await request(app)
        .delete(`/api/topics/${topic.id}`)
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .expect(200);

      // Verify cascade deletion
      const deletedSession = await prisma.session.findUnique({
        where: { id: session.id },
      });
      const deletedInteraction = await prisma.interaction.findUnique({
        where: { id: interaction.id },
      });

      expect(deletedSession).toBeNull();
      expect(deletedInteraction).toBeNull();
    });
  });

  describe('Data Consistency', () => {
    it('should maintain referential integrity', async () => {
      const user = await testHelpers.createTestUser();
      const topic = await testHelpers.createTestTopic(user.id);
      
      // Join topic
      await testHelpers.addTopicAttendee(topic.id, user.id);

      // Verify attendee relationship exists
      const attendeeBefore = await prisma.topicAttendee.findUnique({
        where: {
          topicId_userId: {
            topicId: topic.id,
            userId: user.id,
          },
        },
      });
      expect(attendeeBefore).toBeTruthy();

      // Leave topic via API
      await request(app)
        .delete(`/api/topics/${topic.id}/leave`)
        .set('Authorization', `Bearer ${user.accessToken}`)
        .expect(200);

      // Verify attendee relationship is removed
      const attendeeAfter = await prisma.topicAttendee.findUnique({
        where: {
          topicId_userId: {
            topicId: topic.id,
            userId: user.id,
          },
        },
      });
      expect(attendeeAfter).toBeNull();
    });

    it('should handle concurrent access correctly', async () => {
      const user1 = await testHelpers.createTestUser();
      const user2 = await testHelpers.createTestUser();
      const topic = await testHelpers.createTestTopic(user1.id);

      // Both users try to join the same topic simultaneously
      const joinPromises = [
        request(app)
          .post(`/api/topics/${topic.id}/join`)
          .set('Authorization', `Bearer ${user1.accessToken}`),
        request(app)
          .post(`/api/topics/${topic.id}/join`)
          .set('Authorization', `Bearer ${user2.accessToken}`),
      ];

      const results = await Promise.all(joinPromises);

      // At least one should succeed
      const successCount = results.filter(r => r.status === 200).length;
      expect(successCount).toBeGreaterThanOrEqual(1);

      // Verify final state
      const finalTopic = await request(app)
        .get(`/api/topics/${topic.id}`)
        .set('Authorization', `Bearer ${user1.accessToken}`)
        .expect(200);

      expect(finalTopic.body.attendees.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('API Health and Status', () => {
    it('should provide health check endpoint', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('service', 'Study Group Platform API');
    });

    it('should handle 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/api/nonexistent')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Route not found');
    });

    it('should provide API documentation at root', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Study Group Platform API');
      expect(response.body).toHaveProperty('endpoints');
      expect(response.body.endpoints).toHaveProperty('auth', '/api/auth');
      expect(response.body.endpoints).toHaveProperty('topics', '/api/topics');
    });
  });
});