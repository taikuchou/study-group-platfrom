import { Router } from 'express';
import { InteractionController } from '../controllers/interactionController';
import { requireAuth } from '../middleware/auth';
import { checkResourcePermission } from '../middleware/permissions';

const router = Router();

// All interaction routes require authentication
router.use(requireAuth);

// Public authenticated routes
router.get('/', InteractionController.listInteractions);
router.post('/', checkResourcePermission('interaction', 'create'), InteractionController.createInteraction);

// Resource-specific routes
router.get('/:id', checkResourcePermission('interaction', 'read'), InteractionController.getInteraction);
router.put('/:id', checkResourcePermission('interaction', 'edit'), InteractionController.updateInteraction);
router.delete('/:id', checkResourcePermission('interaction', 'delete'), InteractionController.deleteInteraction);

export default router;