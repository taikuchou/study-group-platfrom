import request from 'supertest';
import app from '../../app';
import { prisma } from '../utils/setup';
import { TestHelpers } from '../utils/testHelpers';

describe('User Management Service', () => {
  let testHelpers: TestHelpers;

  beforeAll(() => {
    testHelpers = new TestHelpers(prisma);
  });

  describe('GET /api/users', () => {
    it('should allow admin to list all users', async () => {
      const admin = await testHelpers.createTestAdmin();
      await testHelpers.createTestUser({ name: 'User 1' });
      await testHelpers.createTestUser({ name: 'User 2' });

      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(3); // admin + 2 users
    });

    it('should reject non-admin user from listing users', async () => {
      const user = await testHelpers.createTestUser();

      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${user.accessToken}`)
        .expect(403);

      expect(response.body.error).toBe('Admin access required');
    });

    it('should reject unauthenticated request', async () => {
      const response = await request(app)
        .get('/api/users')
        .expect(401);

      expect(response.body.error).toBe('No token provided');
    });
  });

  describe('POST /api/users', () => {
    it('should allow admin to create new user', async () => {
      const admin = await testHelpers.createTestAdmin();
      const newUserData = {
        name: 'New User',
        email: 'newuser@example.com',
        role: 'user',
      };

      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .send(newUserData)
        .expect(201);

      expect(response.body.name).toBe(newUserData.name);
      expect(response.body.email).toBe(newUserData.email);
      expect(response.body.role).toBe(newUserData.role);
      expect(response.body).toHaveProperty('temporaryPassword');
    });

    it('should reject non-admin from creating user', async () => {
      const user = await testHelpers.createTestUser();
      const newUserData = {
        name: 'New User',
        email: 'newuser@example.com',
      };

      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${user.accessToken}`)
        .send(newUserData)
        .expect(403);

      expect(response.body.error).toBe('Admin access required');
    });

    it('should reject duplicate email', async () => {
      const admin = await testHelpers.createTestAdmin();
      await testHelpers.createTestUser({ email: 'existing@example.com' });

      const newUserData = {
        name: 'New User',
        email: 'existing@example.com',
      };

      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .send(newUserData)
        .expect(400);

      expect(response.body.error).toBe('User already exists');
    });

    it('should reject invalid user data', async () => {
      const admin = await testHelpers.createTestAdmin();
      const invalidUserData = {
        name: 'A', // Too short
        email: 'invalid-email',
      };

      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .send(invalidUserData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PUT /api/users/:id', () => {
    it('should allow admin to update any user', async () => {
      const admin = await testHelpers.createTestAdmin();
      const user = await testHelpers.createTestUser();

      const updateData = {
        name: 'Updated Name',
        role: 'admin',
      };

      const response = await request(app)
        .put(`/api/users/${user.id}`)
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.name).toBe(updateData.name);
      expect(response.body.role).toBe(updateData.role);
    });

    it('should allow user to update their own profile', async () => {
      const user = await testHelpers.createTestUser();

      const updateData = {
        name: 'Updated Name',
      };

      const response = await request(app)
        .put(`/api/users/${user.id}`)
        .set('Authorization', `Bearer ${user.accessToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.name).toBe(updateData.name);
    });

    it('should reject user updating other users', async () => {
      const user1 = await testHelpers.createTestUser();
      const user2 = await testHelpers.createTestUser();

      const updateData = { name: 'Hacked Name' };

      const response = await request(app)
        .put(`/api/users/${user2.id}`)
        .set('Authorization', `Bearer ${user1.accessToken}`)
        .send(updateData)
        .expect(403);

      expect(response.body.error).toBe('Insufficient permissions');
    });

    it('should reject update of non-existent user', async () => {
      const admin = await testHelpers.createTestAdmin();
      const updateData = { name: 'Updated Name' };

      const response = await request(app)
        .put('/api/users/99999')
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .send(updateData)
        .expect(404);

      expect(response.body.error).toBe('user not found');
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should allow admin to delete user', async () => {
      const admin = await testHelpers.createTestAdmin();
      const user = await testHelpers.createTestUser();

      const response = await request(app)
        .delete(`/api/users/${user.id}`)
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .expect(200);

      expect(response.body.message).toBe('User deleted successfully');

      // Verify user is deleted
      const deletedUser = await prisma.user.findUnique({
        where: { id: user.id },
      });
      expect(deletedUser).toBeNull();
    });

    it('should reject non-admin from deleting user', async () => {
      const user1 = await testHelpers.createTestUser();
      const user2 = await testHelpers.createTestUser();

      const response = await request(app)
        .delete(`/api/users/${user2.id}`)
        .set('Authorization', `Bearer ${user1.accessToken}`)
        .expect(403);

      expect(response.body.error).toBe('Admin access required');
    });

    it('should reject deletion of non-existent user', async () => {
      const admin = await testHelpers.createTestAdmin();

      const response = await request(app)
        .delete('/api/users/99999')
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .expect(404);

      expect(response.body.error).toBe('User not found');
    });
  });
});