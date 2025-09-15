import { Request, Response } from 'express';
import { db } from '../services/database';
import { createSessionSchema, updateSessionSchema } from '../utils/validation';
import { Session, ReferenceLink, prismaReferenceCategoryToFrontend } from '../types';

export class SessionController {
  static formatSession = (session: any): Session => ({
    id: session.id,
    topicId: session.topicId,
    presenterId: session.presenterId,
    startDateTime: session.startDateTime.toISOString().replace('T', ' ').slice(0, 16),
    scope: session.scope,
    outline: session.outline || '',
    noteLinks: session.noteLinks,
    references: Array.isArray(session.references) 
      ? (session.references as any[]).map((ref: any) => ({
          label: ref.label || '',
          description: ref.description || '',
          url: ref.url || '',
          category: ref.category || 'web'
        }))
      : [],
    attendees: session.attendees?.map((a: any) => a.userId) || [],
  });

  static async listSessions(req: Request, res: Response) {
    try {
      const sessions = await db.session.findMany({
        include: {
          attendees: true,
        },
        orderBy: { startDateTime: 'desc' },
      });

      const formattedSessions: Session[] = sessions.map(SessionController.formatSession);

      res.status(200).json(formattedSessions);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to fetch sessions' });
    }
  }

  static async getSession(req: Request, res: Response) {
    try {
      const sessionId = parseInt(req.params.id);

      const session = await db.session.findUnique({
        where: { id: sessionId },
        include: {
          attendees: true,
        },
      });

      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }

      const formattedSession = SessionController.formatSession(session);

      res.status(200).json(formattedSession);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to fetch session' });
    }
  }

  static async createSession(req: Request, res: Response) {
    try {
      const sessionData = createSessionSchema.parse(req.body);

      // Verify topic exists
      const topic = await db.topic.findUnique({
        where: { id: sessionData.topicId },
      });

      if (!topic) {
        return res.status(404).json({ error: 'Topic not found' });
      }

      // Verify presenter exists
      const presenter = await db.user.findUnique({
        where: { id: sessionData.presenterId },
      });

      if (!presenter) {
        return res.status(404).json({ error: 'Presenter not found' });
      }

      const session = await db.session.create({
        data: {
          topicId: sessionData.topicId,
          presenterId: sessionData.presenterId,
          startDateTime: new Date(sessionData.startDateTime.replace(' ', 'T')),
          scope: sessionData.scope,
          outline: sessionData.outline || '',
          noteLinks: sessionData.noteLinks || [],
          references: sessionData.references?.map(ref => ({
            label: ref.label,
            description: ref.description,
            url: ref.url,
            category: ref.category
          })) || [],
        },
        include: {
          attendees: true,
        },
      });

      const formattedSession = SessionController.formatSession(session);

      res.status(201).json(formattedSession);
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Failed to create session' });
    }
  }

  static async updateSession(req: Request, res: Response) {
    try {
      const sessionId = parseInt(req.params.id);
      const updates = updateSessionSchema.parse({ ...req.body, id: sessionId });

      const session = await db.session.findUnique({
        where: { id: sessionId },
      });

      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }

      const updateData: any = {};
      if (updates.topicId) updateData.topicId = updates.topicId;
      if (updates.presenterId) updateData.presenterId = updates.presenterId;
      if (updates.startDateTime) {
        updateData.startDateTime = new Date(updates.startDateTime.replace(' ', 'T'));
      }
      if (updates.scope) updateData.scope = updates.scope;
      if (updates.outline !== undefined) updateData.outline = updates.outline;
      if (updates.noteLinks) updateData.noteLinks = updates.noteLinks;
      if (updates.references) {
        updateData.references = updates.references.map(ref => ({
          label: ref.label,
          description: ref.description,
          url: ref.url,
          category: ref.category
        }));
      }

      const updatedSession = await db.session.update({
        where: { id: sessionId },
        data: updateData,
        include: {
          attendees: true,
        },
      });

      const formattedSession = SessionController.formatSession(updatedSession);

      res.status(200).json(formattedSession);
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Failed to update session' });
    }
  }

  static async deleteSession(req: Request, res: Response) {
    try {
      const sessionId = parseInt(req.params.id);

      const session = await db.session.findUnique({
        where: { id: sessionId },
      });

      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }

      await db.session.delete({
        where: { id: sessionId },
      });

      res.status(200).json({ message: 'Session deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to delete session' });
    }
  }

  static async getSessionsByTopic(req: Request, res: Response) {
    try {
      const topicId = parseInt(req.params.id);

      const sessions = await db.session.findMany({
        where: { topicId },
        include: {
          attendees: true,
        },
        orderBy: { startDateTime: 'asc' },
      });

      const formattedSessions: Session[] = sessions.map(SessionController.formatSession);

      res.status(200).json(formattedSessions);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to fetch sessions for topic' });
    }
  }
}