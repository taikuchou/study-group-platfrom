import request from 'supertest';
import app from '../../app';
import { prisma } from '../utils/setup';
import { TestHelpers } from '../utils/testHelpers';

describe('Interaction Management Service', () => {
  let testHelpers: TestHelpers;

  beforeAll(() => {
    testHelpers = new TestHelpers(prisma);
  });

  describe('GET /api/interactions', () => {
    it('should return list of interactions for authenticated user', async () => {
      const user = await testHelpers.createTestUser();
      const topic = await testHelpers.createTestTopic(user.id);
      const session = await testHelpers.createTestSession(topic.id, user.id);
      const interaction = await testHelpers.createTestInteraction(session.id, user.id);

      const response = await request(app)
        .get('/api/interactions')
        .set('Authorization', `Bearer ${user.accessToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(1);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('type');
      expect(response.body[0]).toHaveProperty('authorId');
    });

    it('should reject unauthenticated request', async () => {
      const response = await request(app)
        .get('/api/interactions')
        .expect(401);

      expect(response.body.error).toBe('No token provided');
    });
  });

  describe('POST /api/interactions', () => {
    it('should create question interaction', async () => {
      const user = await testHelpers.createTestUser();
      const topic = await testHelpers.createTestTopic(user.id);
      const session = await testHelpers.createTestSession(topic.id, user.id);

      const interactionData = {
        type: 'question',
        sessionId: session.id,
        content: 'What is the best practice for React hooks?',
      };

      const response = await request(app)
        .post('/api/interactions')
        .set('Authorization', `Bearer ${user.accessToken}`)
        .send(interactionData)
        .expect(201);

      expect(response.body.type).toBe(interactionData.type);
      expect(response.body.sessionId).toBe(session.id);
      expect(response.body.authorId).toBe(user.id);
      expect(response.body.content).toBe(interactionData.content);
    });

    it('should create noteLink interaction', async () => {
      const user = await testHelpers.createTestUser();
      const topic = await testHelpers.createTestTopic(user.id);
      const session = await testHelpers.createTestSession(topic.id, user.id);

      const interactionData = {
        type: 'noteLink',
        sessionId: session.id,
        label: 'React Documentation',
        description: 'Official React documentation',
        url: 'https://reactjs.org/docs',
      };

      const response = await request(app)
        .post('/api/interactions')
        .set('Authorization', `Bearer ${user.accessToken}`)
        .send(interactionData)
        .expect(201);

      expect(response.body.type).toBe('noteLink');
      expect(response.body.label).toBe(interactionData.label);
      expect(response.body.description).toBe(interactionData.description);
      expect(response.body.url).toBe(interactionData.url);
    });

    it('should create weeklyInsight interaction', async () => {
      const user = await testHelpers.createTestUser();
      const topic = await testHelpers.createTestTopic(user.id);
      const session = await testHelpers.createTestSession(topic.id, user.id);

      const interactionData = {
        type: 'weeklyInsight',
        sessionId: session.id,
        content: 'Learned about useCallback optimization this week.',
      };

      const response = await request(app)
        .post('/api/interactions')
        .set('Authorization', `Bearer ${user.accessToken}`)
        .send(interactionData)
        .expect(201);

      expect(response.body.type).toBe('weeklyInsight');
      expect(response.body.content).toBe(interactionData.content);
    });

    it('should reject interaction with non-existent session', async () => {
      const user = await testHelpers.createTestUser();

      const interactionData = {
        type: 'question',
        sessionId: 99999,
        content: 'Test question',
      };

      const response = await request(app)
        .post('/api/interactions')
        .set('Authorization', `Bearer ${user.accessToken}`)
        .send(interactionData)
        .expect(404);

      expect(response.body.error).toBe('Session not found');
    });

    it('should reject noteLink interaction without required fields', async () => {
      const user = await testHelpers.createTestUser();
      const topic = await testHelpers.createTestTopic(user.id);
      const session = await testHelpers.createTestSession(topic.id, user.id);

      const invalidInteractionData = {
        type: 'noteLink',
        sessionId: session.id,
        label: 'Missing URL and description',
      };

      const response = await request(app)
        .post('/api/interactions')
        .set('Authorization', `Bearer ${user.accessToken}`)
        .send(invalidInteractionData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should reject non-noteLink interaction without content', async () => {
      const user = await testHelpers.createTestUser();
      const topic = await testHelpers.createTestTopic(user.id);
      const session = await testHelpers.createTestSession(topic.id, user.id);

      const invalidInteractionData = {
        type: 'question',
        sessionId: session.id,
        // Missing content
      };

      const response = await request(app)
        .post('/api/interactions')
        .set('Authorization', `Bearer ${user.accessToken}`)
        .send(invalidInteractionData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/interactions/:id', () => {
    it('should return interaction details', async () => {
      const user = await testHelpers.createTestUser();
      const topic = await testHelpers.createTestTopic(user.id);
      const session = await testHelpers.createTestSession(topic.id, user.id);
      const interaction = await testHelpers.createTestInteraction(session.id, user.id);

      const response = await request(app)
        .get(`/api/interactions/${interaction.id}`)
        .set('Authorization', `Bearer ${user.accessToken}`)
        .expect(200);

      expect(response.body.id).toBe(interaction.id);
      expect(response.body.authorId).toBe(user.id);
      expect(response.body.sessionId).toBe(session.id);
    });

    it('should return 404 for non-existent interaction', async () => {
      const user = await testHelpers.createTestUser();

      const response = await request(app)
        .get('/api/interactions/99999')
        .set('Authorization', `Bearer ${user.accessToken}`)
        .expect(404);

      expect(response.body.error).toBe('interaction not found');
    });
  });

  describe('PUT /api/interactions/:id', () => {
    it('should allow author to update interaction', async () => {
      const author = await testHelpers.createTestUser();
      const topic = await testHelpers.createTestTopic(author.id);
      const session = await testHelpers.createTestSession(topic.id, author.id);
      const interaction = await testHelpers.createTestInteraction(session.id, author.id);

      const updateData = {
        content: 'Updated question content',
      };

      const response = await request(app)
        .put(`/api/interactions/${interaction.id}`)
        .set('Authorization', `Bearer ${author.accessToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.content).toBe(updateData.content);
    });

    it('should allow admin to update any interaction', async () => {
      const author = await testHelpers.createTestUser();
      const admin = await testHelpers.createTestAdmin();
      const topic = await testHelpers.createTestTopic(author.id);
      const session = await testHelpers.createTestSession(topic.id, author.id);
      const interaction = await testHelpers.createTestInteraction(session.id, author.id);

      const updateData = { content: 'Admin updated content' };

      const response = await request(app)
        .put(`/api/interactions/${interaction.id}`)
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.content).toBe(updateData.content);
    });

    it('should reject non-author/non-admin from updating interaction', async () => {
      const author = await testHelpers.createTestUser();
      const otherUser = await testHelpers.createTestUser();
      const topic = await testHelpers.createTestTopic(author.id);
      const session = await testHelpers.createTestSession(topic.id, author.id);
      const interaction = await testHelpers.createTestInteraction(session.id, author.id);

      const updateData = { content: 'Unauthorized update' };

      const response = await request(app)
        .put(`/api/interactions/${interaction.id}`)
        .set('Authorization', `Bearer ${otherUser.accessToken}`)
        .send(updateData)
        .expect(403);

      expect(response.body.error).toBe('Insufficient permissions');
    });
  });

  describe('DELETE /api/interactions/:id', () => {
    it('should allow admin to delete interaction', async () => {
      const author = await testHelpers.createTestUser();
      const admin = await testHelpers.createTestAdmin();
      const topic = await testHelpers.createTestTopic(author.id);
      const session = await testHelpers.createTestSession(topic.id, author.id);
      const interaction = await testHelpers.createTestInteraction(session.id, author.id);

      const response = await request(app)
        .delete(`/api/interactions/${interaction.id}`)
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .expect(200);

      expect(response.body.message).toBe('Interaction deleted successfully');

      // Verify interaction is deleted
      const deletedInteraction = await prisma.interaction.findUnique({
        where: { id: interaction.id },
      });
      expect(deletedInteraction).toBeNull();
    });

    it('should reject non-admin from deleting interaction', async () => {
      const author = await testHelpers.createTestUser();
      const topic = await testHelpers.createTestTopic(author.id);
      const session = await testHelpers.createTestSession(topic.id, author.id);
      const interaction = await testHelpers.createTestInteraction(session.id, author.id);

      const response = await request(app)
        .delete(`/api/interactions/${interaction.id}`)
        .set('Authorization', `Bearer ${author.accessToken}`)
        .expect(403);

      expect(response.body.error).toBe('Insufficient permissions');
    });

    it('should reject deletion of non-existent interaction', async () => {
      const admin = await testHelpers.createTestAdmin();

      const response = await request(app)
        .delete('/api/interactions/99999')
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .expect(404);

      expect(response.body.error).toBe('interaction not found');
    });
  });

  describe('GET /api/sessions/:id/interactions', () => {
    it('should return interactions for specific session', async () => {
      const user = await testHelpers.createTestUser();
      const topic = await testHelpers.createTestTopic(user.id);
      const session = await testHelpers.createTestSession(topic.id, user.id);

      const interaction1 = await testHelpers.createTestInteraction(session.id, user.id, {
        content: 'First question',
      });
      const interaction2 = await testHelpers.createTestInteraction(session.id, user.id, {
        type: 'WEEKLY_INSIGHT',
        content: 'Weekly insight',
      });

      const response = await request(app)
        .get(`/api/sessions/${session.id}/interactions`)
        .set('Authorization', `Bearer ${user.accessToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      expect(response.body.some((i: any) => i.content === 'First question')).toBe(true);
      expect(response.body.some((i: any) => i.content === 'Weekly insight')).toBe(true);
    });

    it('should return empty array for session with no interactions', async () => {
      const user = await testHelpers.createTestUser();
      const topic = await testHelpers.createTestTopic(user.id);
      const session = await testHelpers.createTestSession(topic.id, user.id);

      const response = await request(app)
        .get(`/api/sessions/${session.id}/interactions`)
        .set('Authorization', `Bearer ${user.accessToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });
  });

  describe('Interaction Types', () => {
    let user: any, topic: any, session: any;

    beforeEach(async () => {
      user = await testHelpers.createTestUser();
      topic = await testHelpers.createTestTopic(user.id);
      session = await testHelpers.createTestSession(topic.id, user.id);
    });

    it('should handle speakerFeedback interaction', async () => {
      const interactionData = {
        type: 'speakerFeedback',
        sessionId: session.id,
        content: 'Great presentation, very clear explanations!',
      };

      const response = await request(app)
        .post('/api/interactions')
        .set('Authorization', `Bearer ${user.accessToken}`)
        .send(interactionData)
        .expect(201);

      expect(response.body.type).toBe('speakerFeedback');
      expect(response.body.content).toBe(interactionData.content);
    });

    it('should handle reference interaction', async () => {
      const interactionData = {
        type: 'reference',
        sessionId: session.id,
        content: 'MDN Web Docs: JavaScript Reference',
      };

      const response = await request(app)
        .post('/api/interactions')
        .set('Authorization', `Bearer ${user.accessToken}`)
        .send(interactionData)
        .expect(201);

      expect(response.body.type).toBe('reference');
      expect(response.body.content).toBe(interactionData.content);
    });

    it('should handle outlineSuggestion interaction', async () => {
      const interactionData = {
        type: 'outlineSuggestion',
        sessionId: session.id,
        content: 'Consider adding a section on performance optimization',
      };

      const response = await request(app)
        .post('/api/interactions')
        .set('Authorization', `Bearer ${user.accessToken}`)
        .send(interactionData)
        .expect(201);

      expect(response.body.type).toBe('outlineSuggestion');
      expect(response.body.content).toBe(interactionData.content);
    });
  });
});