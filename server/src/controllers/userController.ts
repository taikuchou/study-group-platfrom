import { Request, Response } from 'express';
import { db } from '../services/database';
import { AuthUtils } from '../utils/auth';
import { createUserSchema, updateUserSchema } from '../utils/validation';
import { prismaUserToUser } from '../types';
import { UserRole } from '@prisma/client';

export class UserController {
  static async listUsers(req: Request, res: Response) {
    try {
      const users = await db.user.findMany({
        orderBy: { createdAt: 'desc' },
      });

      res.status(200).json(users.map(prismaUserToUser));
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to fetch users' });
    }
  }

  static async getUserNames(req: Request, res: Response) {
    try {
      // Return basic user info (id and name only) for all authenticated users
      const users = await db.user.findMany({
        select: {
          id: true,
          name: true,
        },
        orderBy: { name: 'asc' },
      });

      res.status(200).json(users);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to fetch user names' });
    }
  }

  static async createUser(req: Request, res: Response) {
    try {
      const { name, email, role = 'user' } = createUserSchema.parse(req.body);

      const existingUser = await db.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }

      // Generate a default password for admin-created users
      const defaultPassword = Math.random().toString(36).slice(-12);
      const passwordHash = await AuthUtils.hashPassword(defaultPassword);

      const user = await db.user.create({
        data: {
          name,
          email,
          passwordHash,
          role: role.toUpperCase() as UserRole,
        },
      });

      res.status(201).json({
        ...prismaUserToUser(user),
        temporaryPassword: defaultPassword, // Send temporary password to admin
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Failed to create user' });
    }
  }

  static async updateUser(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.id);
      const updates = updateUserSchema.parse({ ...req.body, id: userId });

      const user = await db.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const updateData: any = {};
      if (updates.name) updateData.name = updates.name;
      if (updates.email) updateData.email = updates.email;
      if (updates.role) updateData.role = updates.role.toUpperCase() as UserRole;

      const updatedUser = await db.user.update({
        where: { id: userId },
        data: updateData,
      });

      res.status(200).json(prismaUserToUser(updatedUser));
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Failed to update user' });
    }
  }

  static async deleteUser(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.id);
      const currentUserId = (req as any).user?.id;

      const user = await db.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Prevent users from deleting themselves
      if (userId === currentUserId) {
        return res.status(400).json({ error: 'Cannot delete your own account' });
      }

      // Check if user has created content that would prevent deletion
      const [topicsCount, sessionsCount, interactionsCount] = await Promise.all([
        db.topic.count({ where: { createdBy: userId } }),
        db.session.count({ where: { presenterId: userId } }),
        db.interaction.count({ where: { authorId: userId } })
      ]);

      const hasContent = topicsCount > 0 || sessionsCount > 0 || interactionsCount > 0;

      if (hasContent) {
        const contentDetails = [];
        if (topicsCount > 0) contentDetails.push(`${topicsCount} topic${topicsCount > 1 ? 's' : ''}`);
        if (sessionsCount > 0) contentDetails.push(`${sessionsCount} session${sessionsCount > 1 ? 's' : ''}`);
        if (interactionsCount > 0) contentDetails.push(`${interactionsCount} interaction${interactionsCount > 1 ? 's' : ''}`);

        return res.status(400).json({ 
          error: `Cannot delete user: has created ${contentDetails.join(', ')}. Please reassign or delete this content first.`,
          details: {
            topics: topicsCount,
            sessions: sessionsCount,
            interactions: interactionsCount
          }
        });
      }

      await db.user.delete({
        where: { id: userId },
      });

      res.status(200).json({ message: 'User deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to delete user' });
    }
  }
}