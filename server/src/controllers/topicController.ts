import { Request, Response } from 'express';
import { db } from '../services/database';
import { createTopicSchema, updateTopicSchema } from '../utils/validation';
import { Topic, prismaIntervalTypeToFrontend } from '../types';
import { IntervalType } from '@prisma/client';

export class TopicController {
  static async listTopics(req: Request, res: Response) {
    try {
      const topics = await db.topic.findMany({
        include: {
          attendees: true,
          sessions: {
            include: {
              attendees: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      const formattedTopics: Topic[] = topics.map((topic) => ({
        id: topic.id,
        title: topic.title,
        startDate: topic.startDate.toISOString().split('T')[0],
        endDate: topic.endDate.toISOString().split('T')[0],
        intervalType: prismaIntervalTypeToFrontend(topic.intervalType),
        outline: topic.outline || '',
        referenceUrls: topic.referenceUrls,
        keywords: topic.keywords,
        attendees: topic.attendees.map((a) => a.userId),
        createdBy: topic.createdBy,
        createdAt: topic.createdAt.toISOString().split('T')[0],
        sessions: topic.sessions.map((session) => ({
          id: session.id,
          topicId: session.topicId,
          presenterId: session.presenterId,
          startDateTime: session.startDateTime.toISOString().replace('T', ' ').slice(0, 16),
          scope: session.scope,
          outline: session.outline || '',
          noteLinks: session.noteLinks,
          references: (session.references as any[]).map((ref: any) => ({
            label: ref.label || '',
            description: ref.description || '',
            url: ref.url || '',
            category: ref.category || 'web'
          })),
          attendees: session.attendees.map((a) => a.userId),
        })),
      }));

      res.status(200).json(formattedTopics);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to fetch topics' });
    }
  }

  static async getTopic(req: Request, res: Response) {
    try {
      const topicId = parseInt(req.params.id);

      const topic = await db.topic.findUnique({
        where: { id: topicId },
        include: {
          attendees: true,
          sessions: {
            include: {
              attendees: true,
            },
          },
        },
      });

      if (!topic) {
        return res.status(404).json({ error: 'Topic not found' });
      }

      const formattedTopic: Topic = {
        id: topic.id,
        title: topic.title,
        startDate: topic.startDate.toISOString().split('T')[0],
        endDate: topic.endDate.toISOString().split('T')[0],
        intervalType: prismaIntervalTypeToFrontend(topic.intervalType),
        outline: topic.outline || '',
        referenceUrls: topic.referenceUrls,
        keywords: topic.keywords,
        attendees: topic.attendees.map((a) => a.userId),
        createdBy: topic.createdBy,
        createdAt: topic.createdAt.toISOString().split('T')[0],
        sessions: topic.sessions.map((session) => ({
          id: session.id,
          topicId: session.topicId,
          presenterId: session.presenterId,
          startDateTime: session.startDateTime.toISOString().replace('T', ' ').slice(0, 16),
          scope: session.scope,
          outline: session.outline || '',
          noteLinks: session.noteLinks,
          references: (session.references as any[]).map((ref: any) => ({
            label: ref.label || '',
            description: ref.description || '',
            url: ref.url || '',
            category: ref.category || 'web'
          })),
          attendees: session.attendees.map((a) => a.userId),
        })),
      };

      res.status(200).json(formattedTopic);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to fetch topic' });
    }
  }

  static async createTopic(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const topicData = createTopicSchema.parse(req.body);

      const topic = await db.topic.create({
        data: {
          title: topicData.title,
          startDate: new Date(topicData.startDate),
          endDate: new Date(topicData.endDate),
          intervalType: topicData.intervalType as IntervalType,
          outline: topicData.outline || '',
          referenceUrls: topicData.referenceUrls || [],
          keywords: topicData.keywords || [],
          createdBy: userId,
        },
        include: {
          attendees: true,
          sessions: {
            include: {
              attendees: true,
            },
          },
        },
      });

      // Handle attendees: always include creator, plus any additional attendees from form
      const attendeesToAdd = topicData.attendees || [];
      const uniqueAttendees = [userId, ...attendeesToAdd.filter(id => id !== userId)];

      if (uniqueAttendees.length > 0) {
        await db.topicAttendee.createMany({
          data: uniqueAttendees.map(attendeeId => ({
            topicId: topic.id,
            userId: attendeeId,
          })),
        });
      }

      const formattedTopic: Topic = {
        id: topic.id,
        title: topic.title,
        startDate: topic.startDate.toISOString().split('T')[0],
        endDate: topic.endDate.toISOString().split('T')[0],
        intervalType: prismaIntervalTypeToFrontend(topic.intervalType),
        outline: topic.outline || '',
        referenceUrls: topic.referenceUrls,
        keywords: topic.keywords,
        attendees: uniqueAttendees,
        createdBy: topic.createdBy,
        createdAt: topic.createdAt.toISOString().split('T')[0],
        sessions: [],
      };

      res.status(201).json(formattedTopic);
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Failed to create topic' });
    }
  }

  static async updateTopic(req: Request, res: Response) {
    try {
      const topicId = parseInt(req.params.id);
      const updates = updateTopicSchema.parse({ ...req.body, id: topicId });

      const topic = await db.topic.findUnique({
        where: { id: topicId },
      });

      if (!topic) {
        return res.status(404).json({ error: 'Topic not found' });
      }

      const updateData: any = {};
      if (updates.title) updateData.title = updates.title;
      if (updates.startDate) updateData.startDate = new Date(updates.startDate);
      if (updates.endDate) updateData.endDate = new Date(updates.endDate);
      if (updates.intervalType) updateData.intervalType = updates.intervalType as IntervalType;
      if (updates.outline !== undefined) updateData.outline = updates.outline;
      if (updates.referenceUrls) updateData.referenceUrls = updates.referenceUrls;
      if (updates.keywords) updateData.keywords = updates.keywords;

      const updatedTopic = await db.topic.update({
        where: { id: topicId },
        data: updateData,
        include: {
          attendees: true,
          sessions: {
            include: {
              attendees: true,
            },
          },
        },
      });

      // Handle attendees updates if provided
      if (updates.attendees !== undefined) {
        // Remove all existing attendees
        await db.topicAttendee.deleteMany({
          where: { topicId },
        });

        // Add new attendees
        if (updates.attendees.length > 0) {
          await db.topicAttendee.createMany({
            data: updates.attendees.map(userId => ({
              topicId,
              userId,
            })),
          });
        }

        // Fetch updated topic with new attendees
        const finalTopic = await db.topic.findUnique({
          where: { id: topicId },
          include: {
            attendees: true,
            sessions: {
              include: {
                attendees: true,
              },
            },
          },
        });

        if (finalTopic) {
          const formattedTopic: Topic = {
            id: finalTopic.id,
            title: finalTopic.title,
            startDate: finalTopic.startDate.toISOString().split('T')[0],
            endDate: finalTopic.endDate.toISOString().split('T')[0],
            intervalType: prismaIntervalTypeToFrontend(finalTopic.intervalType),
            outline: finalTopic.outline || '',
            referenceUrls: finalTopic.referenceUrls,
            keywords: finalTopic.keywords,
            attendees: finalTopic.attendees.map((a) => a.userId),
            createdBy: finalTopic.createdBy,
            createdAt: finalTopic.createdAt.toISOString().split('T')[0],
            sessions: finalTopic.sessions.map((session) => ({
              id: session.id,
              topicId: session.topicId,
              presenterId: session.presenterId,
              startDateTime: session.startDateTime.toISOString().replace('T', ' ').slice(0, 16),
              scope: session.scope,
              outline: session.outline || '',
              noteLinks: session.noteLinks,
              references: session.references,
              attendees: session.attendees.map((a) => a.userId),
            })),
          };

          return res.status(200).json(formattedTopic);
        }
      }

      const formattedTopic: Topic = {
        id: updatedTopic.id,
        title: updatedTopic.title,
        startDate: updatedTopic.startDate.toISOString().split('T')[0],
        endDate: updatedTopic.endDate.toISOString().split('T')[0],
        intervalType: prismaIntervalTypeToFrontend(updatedTopic.intervalType),
        outline: updatedTopic.outline || '',
        referenceUrls: updatedTopic.referenceUrls,
        keywords: updatedTopic.keywords,
        attendees: updatedTopic.attendees.map((a) => a.userId),
        createdBy: updatedTopic.createdBy,
        createdAt: updatedTopic.createdAt.toISOString().split('T')[0],
        sessions: updatedTopic.sessions.map((session) => ({
          id: session.id,
          topicId: session.topicId,
          presenterId: session.presenterId,
          startDateTime: session.startDateTime.toISOString().replace('T', ' ').slice(0, 16),
          scope: session.scope,
          outline: session.outline || '',
          noteLinks: session.noteLinks,
          references: session.references,
          attendees: session.attendees.map((a) => a.userId),
        })),
      };

      res.status(200).json(formattedTopic);
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Failed to update topic' });
    }
  }

  static async deleteTopic(req: Request, res: Response) {
    try {
      const topicId = parseInt(req.params.id);

      const topic = await db.topic.findUnique({
        where: { id: topicId },
      });

      if (!topic) {
        return res.status(404).json({ error: 'Topic not found' });
      }

      await db.topic.delete({
        where: { id: topicId },
      });

      res.status(200).json({ message: 'Topic deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to delete topic' });
    }
  }

  static async joinTopic(req: Request, res: Response) {
    try {
      const topicId = parseInt(req.params.id);
      const userId = (req as any).user?.id;

      const topic = await db.topic.findUnique({
        where: { id: topicId },
      });

      if (!topic) {
        return res.status(404).json({ error: 'Topic not found' });
      }

      const existingAttendee = await db.topicAttendee.findUnique({
        where: {
          topicId_userId: {
            topicId,
            userId,
          },
        },
      });

      if (existingAttendee) {
        return res.status(400).json({ error: 'Already joined this topic' });
      }

      await db.topicAttendee.create({
        data: {
          topicId,
          userId,
        },
      });

      res.status(200).json({ message: 'Successfully joined topic' });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to join topic' });
    }
  }

  static async leaveTopic(req: Request, res: Response) {
    try {
      const topicId = parseInt(req.params.id);
      const userId = (req as any).user?.id;

      const attendee = await db.topicAttendee.findUnique({
        where: {
          topicId_userId: {
            topicId,
            userId,
          },
        },
      });

      if (!attendee) {
        return res.status(404).json({ error: 'Not a member of this topic' });
      }

      await db.topicAttendee.delete({
        where: {
          topicId_userId: {
            topicId,
            userId,
          },
        },
      });

      res.status(200).json({ message: 'Successfully left topic' });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to leave topic' });
    }
  }
}