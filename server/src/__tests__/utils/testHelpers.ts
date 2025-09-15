import { PrismaClient, User, Topic, Session, Interaction } from '@prisma/client';
import { AuthUtils } from '../../utils/auth';
import { AuthUser } from '../../types';

export interface TestUser extends User {
  accessToken?: string;
}

export class TestHelpers {
  constructor(private prisma: PrismaClient) {}

  async createTestUser(data: Partial<User> = {}): Promise<TestUser> {
    const defaultUser = {
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      passwordHash: await AuthUtils.hashPassword('password123'),
      role: 'USER' as const,
    };

    const user = await this.prisma.user.create({
      data: { ...defaultUser, ...data },
    });

    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      role: user.role.toLowerCase() as 'user' | 'admin',
    };

    const { accessToken } = AuthUtils.generateTokens(authUser);

    return { ...user, accessToken };
  }

  async createTestAdmin(): Promise<TestUser> {
    return this.createTestUser({ role: 'ADMIN' });
  }

  async createTestTopic(creatorId: number, data: Partial<Topic> = {}): Promise<Topic> {
    const defaultTopic = {
      title: 'Test Topic',
      startDate: new Date('2024-02-01'),
      endDate: new Date('2024-04-30'),
      intervalType: 'WEEKLY' as const,
      outline: 'Test topic outline',
      referenceUrls: ['https://example.com'],
      keywords: ['test', 'topic'],
      createdBy: creatorId,
    };

    return this.prisma.topic.create({
      data: { ...defaultTopic, ...data },
    });
  }

  async createTestSession(topicId: number, presenterId: number, data: Partial<Session> = {}): Promise<Session> {
    const defaultSession = {
      topicId,
      presenterId,
      startDateTime: new Date('2024-02-08T19:00:00'),
      scope: 'Test Session',
      outline: 'Test session outline',
      noteLinks: [],
      references: [],
    };

    return this.prisma.session.create({
      data: { ...defaultSession, ...data },
    });
  }

  async createTestInteraction(sessionId: number, authorId: number, data: Partial<Interaction> = {}): Promise<Interaction> {
    const defaultInteraction = {
      type: 'QUESTION' as const,
      sessionId,
      authorId,
      content: 'Test question content',
    };

    return this.prisma.interaction.create({
      data: { ...defaultInteraction, ...data },
    });
  }

  async addTopicAttendee(topicId: number, userId: number): Promise<void> {
    await this.prisma.topicAttendee.create({
      data: { topicId, userId },
    });
  }

  async addSessionAttendee(sessionId: number, userId: number): Promise<void> {
    await this.prisma.sessionAttendee.create({
      data: { sessionId, userId },
    });
  }

  getAuthHeaders(token: string): Record<string, string> {
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  createRequestBody(data: any): string {
    return JSON.stringify(data);
  }
}