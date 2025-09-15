// ============== Ownership helpers ==============
import type { User, Session } from '../types';

export type Action = 'read' | 'create' | 'edit' | 'delete';

export type Ownable = { createdBy?: number; authorId?: number } & Record<string, unknown>;

/** Admins can do everything; owners can edit/delete their own stuff. */
export function canPerform(user: User | null | undefined, action: Action, resource?: Ownable): boolean {
  if (!user) return false;
  if (user.role === 'admin') return true;
  if (!resource) return action === 'read' || action === 'create';
  const ownerId = resource.createdBy ?? resource.authorId;
  if (ownerId == null) return action === 'read' || action === 'create';
  return ownerId === user.id || action === 'read' || action === 'create';
}

/** Session-specific permissions: Only admins can create, edit, and delete sessions */
export function canPerformSessionAction(user: User | null | undefined, action: Action, session: Session): boolean {
  if (!user) return false;
  if (action === 'read') return true;
  if (action === 'create') return user.role === 'admin'; // Only admins can create sessions
  if (user.role === 'admin') return true;
  // Regular users cannot edit or delete sessions
  return false;
}

/** Interaction-specific permissions: Only admins can delete, authors can edit their own */
export function canPerformInteractionAction(user: User | null | undefined, action: Action, interaction: { authorId: number }): boolean {
  if (!user) return false;
  if (action === 'read') return true;
  if (action === 'create') return true; // Anyone can create interactions
  if (action === 'delete') return user.role === 'admin'; // Only admins can delete interactions
  if (user.role === 'admin') return true;
  // Authors can edit their own interactions
  return interaction.authorId === user.id && action === 'edit';
}
