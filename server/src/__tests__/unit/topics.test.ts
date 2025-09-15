import request from 'supertest';
import app from '../../app';
import { prisma } from '../utils/setup';
import { TestHelpers } from '../utils/testHelpers';

describe('Topic Management Service', () => {
  let testHelpers: TestHelpers;

  beforeAll(() => {
    testHelpers = new TestHelpers(prisma);
  });

  describe('GET /api/topics', () => {
    it('should return list of topics for authenticated user', async () => {
      const user = await testHelpers.createTestUser();
      const topic = await testHelpers.createTestTopic(user.id);

      const response = await request(app)
        .get('/api/topics')
        .set('Authorization', `Bearer ${user.accessToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(1);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('title');
      expect(response.body[0]).toHaveProperty('sessions');
    });

    it('should reject unauthenticated request', async () => {
      const response = await request(app)
        .get('/api/topics')
        .expect(401);

      expect(response.body.error).toBe('No token provided');
    });
  });

  describe('POST /api/topics', () => {
    it('should create new topic with valid data', async () => {
      const user = await testHelpers.createTestUser();
      const topicData = {
        title: 'New Test Topic',
        startDate: '2024-03-01',
        endDate: '2024-05-31',
        intervalType: 'WEEKLY',
        outline: 'Test topic outline',
        referenceUrls: ['https://example.com'],
        keywords: ['test', 'new'],
      };

      const response = await request(app)
        .post('/api/topics')
        .set('Authorization', `Bearer ${user.accessToken}`)
        .send(topicData)
        .expect(201);

      expect(response.body.title).toBe(topicData.title);
      expect(response.body.createdBy).toBe(user.id);
      expect(response.body.attendees).toContain(user.id); // Creator auto-joins
      expect(response.body.sessions).toEqual([]);
    });

    it('should reject invalid topic data', async () => {
      const user = await testHelpers.createTestUser();
      const invalidTopicData = {
        title: 'A', // Too short
        startDate: 'invalid-date',
        endDate: '2024-05-31',
        intervalType: 'INVALID',
      };

      const response = await request(app)
        .post('/api/topics')
        .set('Authorization', `Bearer ${user.accessToken}`)
        .send(invalidTopicData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should reject unauthenticated request', async () => {
      const topicData = {
        title: 'Unauthorized Topic',
        startDate: '2024-03-01',
        endDate: '2024-05-31',
        intervalType: 'WEEKLY',
      };

      const response = await request(app)
        .post('/api/topics')
        .send(topicData)
        .expect(401);

      expect(response.body.error).toBe('No token provided');
    });
  });

  describe('GET /api/topics/:id', () => {
    it('should return topic details for authorized user', async () => {
      const user = await testHelpers.createTestUser();
      const topic = await testHelpers.createTestTopic(user.id);

      const response = await request(app)
        .get(`/api/topics/${topic.id}`)
        .set('Authorization', `Bearer ${user.accessToken}`)
        .expect(200);

      expect(response.body.id).toBe(topic.id);
      expect(response.body.title).toBe(topic.title);
      expect(response.body.createdBy).toBe(user.id);
    });

    it('should return 404 for non-existent topic', async () => {
      const user = await testHelpers.createTestUser();

      const response = await request(app)
        .get('/api/topics/99999')
        .set('Authorization', `Bearer ${user.accessToken}`)
        .expect(404);

      expect(response.body.error).toBe('topic not found');
    });
  });

  describe('PUT /api/topics/:id', () => {
    it('should allow creator to update topic', async () => {
      const user = await testHelpers.createTestUser();
      const topic = await testHelpers.createTestTopic(user.id);

      const updateData = {
        title: 'Updated Topic Title',
        outline: 'Updated outline',
      };

      const response = await request(app)
        .put(`/api/topics/${topic.id}`)
        .set('Authorization', `Bearer ${user.accessToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.title).toBe(updateData.title);
      expect(response.body.outline).toBe(updateData.outline);
    });

    it('should allow admin to update any topic', async () => {
      const user = await testHelpers.createTestUser();
      const admin = await testHelpers.createTestAdmin();
      const topic = await testHelpers.createTestTopic(user.id);

      const updateData = { title: 'Admin Updated Title' };

      const response = await request(app)
        .put(`/api/topics/${topic.id}`)
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.title).toBe(updateData.title);
    });

    it('should reject non-creator/non-admin from updating topic', async () => {
      const creator = await testHelpers.createTestUser();
      const otherUser = await testHelpers.createTestUser();
      const topic = await testHelpers.createTestTopic(creator.id);

      const updateData = { title: 'Unauthorized Update' };

      const response = await request(app)
        .put(`/api/topics/${topic.id}`)
        .set('Authorization', `Bearer ${otherUser.accessToken}`)
        .send(updateData)
        .expect(403);

      expect(response.body.error).toBe('Insufficient permissions');
    });
  });

  describe('DELETE /api/topics/:id', () => {
    it('should allow creator to delete topic', async () => {
      const user = await testHelpers.createTestUser();
      const topic = await testHelpers.createTestTopic(user.id);

      const response = await request(app)
        .delete(`/api/topics/${topic.id}`)
        .set('Authorization', `Bearer ${user.accessToken}`)
        .expect(200);

      expect(response.body.message).toBe('Topic deleted successfully');

      // Verify topic is deleted
      const deletedTopic = await prisma.topic.findUnique({
        where: { id: topic.id },
      });
      expect(deletedTopic).toBeNull();
    });

    it('should allow admin to delete any topic', async () => {
      const user = await testHelpers.createTestUser();
      const admin = await testHelpers.createTestAdmin();
      const topic = await testHelpers.createTestTopic(user.id);

      const response = await request(app)
        .delete(`/api/topics/${topic.id}`)
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .expect(200);

      expect(response.body.message).toBe('Topic deleted successfully');
    });

    it('should reject non-creator/non-admin from deleting topic', async () => {
      const creator = await testHelpers.createTestUser();
      const otherUser = await testHelpers.createTestUser();
      const topic = await testHelpers.createTestTopic(creator.id);

      const response = await request(app)
        .delete(`/api/topics/${topic.id}`)
        .set('Authorization', `Bearer ${otherUser.accessToken}`)
        .expect(403);

      expect(response.body.error).toBe('Insufficient permissions');
    });
  });

  describe('POST /api/topics/:id/join', () => {
    it('should allow user to join topic', async () => {
      const creator = await testHelpers.createTestUser();
      const user = await testHelpers.createTestUser();
      const topic = await testHelpers.createTestTopic(creator.id);

      const response = await request(app)
        .post(`/api/topics/${topic.id}/join`)
        .set('Authorization', `Bearer ${user.accessToken}`)
        .expect(200);

      expect(response.body.message).toBe('Successfully joined topic');

      // Verify user is added as attendee
      const attendee = await prisma.topicAttendee.findUnique({
        where: {
          topicId_userId: {
            topicId: topic.id,
            userId: user.id,
          },
        },
      });
      expect(attendee).toBeTruthy();
    });

    it('should reject joining topic twice', async () => {
      const creator = await testHelpers.createTestUser();
      const user = await testHelpers.createTestUser();
      const topic = await testHelpers.createTestTopic(creator.id);

      // First join
      await request(app)
        .post(`/api/topics/${topic.id}/join`)
        .set('Authorization', `Bearer ${user.accessToken}`)
        .expect(200);

      // Second join attempt
      const response = await request(app)
        .post(`/api/topics/${topic.id}/join`)
        .set('Authorization', `Bearer ${user.accessToken}`)
        .expect(400);

      expect(response.body.error).toBe('Already joined this topic');
    });

    it('should reject joining non-existent topic', async () => {
      const user = await testHelpers.createTestUser();

      const response = await request(app)
        .post('/api/topics/99999/join')
        .set('Authorization', `Bearer ${user.accessToken}`)
        .expect(404);

      expect(response.body.error).toBe('Topic not found');
    });
  });

  describe('DELETE /api/topics/:id/leave', () => {
    it('should allow user to leave topic', async () => {
      const creator = await testHelpers.createTestUser();
      const user = await testHelpers.createTestUser();
      const topic = await testHelpers.createTestTopic(creator.id);
      await testHelpers.addTopicAttendee(topic.id, user.id);

      const response = await request(app)
        .delete(`/api/topics/${topic.id}/leave`)
        .set('Authorization', `Bearer ${user.accessToken}`)
        .expect(200);

      expect(response.body.message).toBe('Successfully left topic');

      // Verify user is removed as attendee
      const attendee = await prisma.topicAttendee.findUnique({
        where: {
          topicId_userId: {
            topicId: topic.id,
            userId: user.id,
          },
        },
      });
      expect(attendee).toBeNull();
    });

    it('should reject leaving topic not joined', async () => {
      const creator = await testHelpers.createTestUser();
      const user = await testHelpers.createTestUser();
      const topic = await testHelpers.createTestTopic(creator.id);

      const response = await request(app)
        .delete(`/api/topics/${topic.id}/leave`)
        .set('Authorization', `Bearer ${user.accessToken}`)
        .expect(404);

      expect(response.body.error).toBe('Not a member of this topic');
    });
  });
});