import { Request, Response } from 'express';
import { db } from '../services/database';
import { createInteractionSchema, updateInteractionSchema } from '../utils/validation';
import { Interaction, prismaInteractionTypeToFrontend, frontendInteractionTypeToPrisma, prismaReferenceCategoryToFrontend, frontendReferenceCategoryToPrisma } from '../types';

export class InteractionController {
  static formatInteraction = (interaction: any): Interaction => {
    const baseInteraction = {
      id: interaction.id,
      type: prismaInteractionTypeToFrontend(interaction.type),
      sessionId: interaction.sessionId,
      authorId: interaction.authorId,
      createdAt: interaction.createdAt.toISOString().replace('T', ' ').slice(0, 16),
    };

    if (interaction.type === 'NOTE_LINK') {
      return {
        ...baseInteraction,
        type: 'noteLink' as const,
        label: interaction.label || '',
        description: interaction.description || '',
        url: interaction.url || '',
      };
    }

    if (interaction.type === 'REFERENCE') {
      return {
        ...baseInteraction,
        type: 'reference' as const,
        label: interaction.label || '',
        description: interaction.description || '',
        url: interaction.url || '',
        category: interaction.category ? prismaReferenceCategoryToFrontend(interaction.category) : 'web',
      };
    }

    return {
      ...baseInteraction,
      content: interaction.content || '',
    } as Interaction;
  };

  static async listInteractions(req: Request, res: Response) {
    try {
      const interactions = await db.interaction.findMany({
        orderBy: { createdAt: 'desc' },
      });

      const formattedInteractions: Interaction[] = interactions.map(InteractionController.formatInteraction);

      res.status(200).json(formattedInteractions);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to fetch interactions' });
    }
  }

  static async getInteraction(req: Request, res: Response) {
    try {
      const interactionId = parseInt(req.params.id);

      const interaction = await db.interaction.findUnique({
        where: { id: interactionId },
      });

      if (!interaction) {
        return res.status(404).json({ error: 'Interaction not found' });
      }

      const formattedInteraction = InteractionController.formatInteraction(interaction);

      res.status(200).json(formattedInteraction);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to fetch interaction' });
    }
  }

  static async createInteraction(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const interactionData = createInteractionSchema.parse(req.body);

      // Verify session exists
      const session = await db.session.findUnique({
        where: { id: interactionData.sessionId },
      });

      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }

      const createData: any = {
        type: frontendInteractionTypeToPrisma(interactionData.type),
        sessionId: interactionData.sessionId,
        authorId: userId,
      };

      if (interactionData.type === 'noteLink') {
        createData.label = interactionData.label;
        createData.description = interactionData.description;
        createData.url = interactionData.url;
      } else if (interactionData.type === 'reference') {
        createData.label = interactionData.label;
        createData.description = interactionData.description;
        createData.url = interactionData.url;
        // createData.category = frontendReferenceCategoryToPrisma(interactionData.category);
      } else {
        createData.content = interactionData.content;
      }

      const interaction = await db.interaction.create({
        data: createData,
      });

      const formattedInteraction = InteractionController.formatInteraction(interaction);

      res.status(201).json(formattedInteraction);
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Failed to create interaction' });
    }
  }

  static async updateInteraction(req: Request, res: Response) {
    try {
      const interactionId = parseInt(req.params.id);
      const updates = updateInteractionSchema.parse({ ...req.body, id: interactionId });

      const interaction = await db.interaction.findUnique({
        where: { id: interactionId },
      });

      if (!interaction) {
        return res.status(404).json({ error: 'Interaction not found' });
      }

      const updateData: any = {};
      if (updates.type) updateData.type = frontendInteractionTypeToPrisma(updates.type);
      if (updates.content !== undefined) updateData.content = updates.content;
      if (updates.label !== undefined) updateData.label = updates.label;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.url !== undefined) updateData.url = updates.url;
      // if (updates.category !== undefined) {
      //   updateData.category = frontendReferenceCategoryToPrisma(updates.category);
      // }

      const updatedInteraction = await db.interaction.update({
        where: { id: interactionId },
        data: updateData,
      });

      const formattedInteraction = InteractionController.formatInteraction(updatedInteraction);

      res.status(200).json(formattedInteraction);
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Failed to update interaction' });
    }
  }

  static async deleteInteraction(req: Request, res: Response) {
    try {
      const interactionId = parseInt(req.params.id);

      const interaction = await db.interaction.findUnique({
        where: { id: interactionId },
      });

      if (!interaction) {
        return res.status(404).json({ error: 'Interaction not found' });
      }

      await db.interaction.delete({
        where: { id: interactionId },
      });

      res.status(200).json({ message: 'Interaction deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to delete interaction' });
    }
  }

  static async getInteractionsBySession(req: Request, res: Response) {
    try {
      const sessionId = parseInt(req.params.id);

      const interactions = await db.interaction.findMany({
        where: { sessionId },
        orderBy: { createdAt: 'asc' },
      });

      const formattedInteractions: Interaction[] = interactions.map(InteractionController.formatInteraction);

      res.status(200).json(formattedInteractions);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to fetch interactions for session' });
    }
  }
}