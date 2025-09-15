import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth';
import { db } from '../services/database';

export type Action = 'read' | 'create' | 'edit' | 'delete';
export type ResourceType = 'user' | 'topic' | 'session' | 'interaction';

export function canPerform(
  userRole: 'user' | 'admin',
  userId: number,
  action: Action,
  resource?: { createdBy?: number; authorId?: number; presenterId?: number }
): boolean {
  if (userRole === 'admin') return true;
  if (!resource) return action === 'read' || action === 'create';
  
  const ownerId = resource.createdBy ?? resource.authorId ?? resource.presenterId;
  if (ownerId == null) return action === 'read' || action === 'create';
  
  return ownerId === userId || action === 'read' || action === 'create';
}

export function canPerformSessionAction(
  userRole: 'user' | 'admin',
  userId: number,
  action: Action,
  session: { presenterId: number }
): boolean {
  if (action === 'read') return true;
  if (action === 'create') return userRole === 'admin';
  if (userRole === 'admin') return true;
  
  return session.presenterId === userId && (action === 'edit' || action === 'delete');
}

export function canPerformInteractionAction(
  userRole: 'user' | 'admin',
  userId: number,
  action: Action,
  interaction: { authorId: number }
): boolean {
  if (action === 'read') return true;
  if (action === 'create') return true;
  if (action === 'delete') return userRole === 'admin';
  if (userRole === 'admin') return true;
  
  return interaction.authorId === userId && action === 'edit';
}

export function checkResourcePermission(resourceType: ResourceType, action: Action) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { user } = req;
    const resourceId = parseInt(req.params.id);

    try {
      let resource: any = null;
      let hasPermission = false;

      switch (resourceType) {
        case 'user':
          if (action === 'create' && user.role !== 'admin') {
            return res.status(403).json({ error: 'Only admins can create users' });
          }
          if (resourceId) {
            resource = await db.user.findUnique({ where: { id: resourceId } });
            hasPermission = user.role === 'admin' || (user.id === resourceId && action !== 'delete');
          } else {
            hasPermission = user.role === 'admin';
          }
          break;

        case 'topic':
          if (resourceId) {
            resource = await db.topic.findUnique({ where: { id: resourceId } });
            hasPermission = canPerform(user.role, user.id, action, resource);
          } else {
            hasPermission = action === 'read' || action === 'create';
          }
          break;

        case 'session':
          if (resourceId) {
            resource = await db.session.findUnique({ where: { id: resourceId } });
            hasPermission = canPerformSessionAction(user.role, user.id, action, resource);
          } else {
            hasPermission = action === 'read' || user.role === 'admin';
          }
          break;

        case 'interaction':
          if (resourceId) {
            resource = await db.interaction.findUnique({ where: { id: resourceId } });
            hasPermission = canPerformInteractionAction(user.role, user.id, action, resource);
          } else {
            hasPermission = action === 'read' || action === 'create';
          }
          break;

        default:
          return res.status(400).json({ error: 'Invalid resource type' });
      }

      if (!hasPermission) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      if (resourceId && !resource && action !== 'create') {
        return res.status(404).json({ error: `${resourceType} not found` });
      }

      next();
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Permission check failed' });
    }
  };
}