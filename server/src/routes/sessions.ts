import { Router } from 'express';
import { SessionController } from '../controllers/sessionController';
import { requireAuth } from '../middleware/auth';
import { checkResourcePermission } from '../middleware/permissions';

const router = Router();

// All session routes require authentication
router.use(requireAuth);

// Public authenticated routes
router.get('/', SessionController.listSessions);
router.post('/', checkResourcePermission('session', 'create'), SessionController.createSession);

// Resource-specific routes
router.get('/:id', checkResourcePermission('session', 'read'), SessionController.getSession);
router.put('/:id', checkResourcePermission('session', 'edit'), SessionController.updateSession);
router.delete('/:id', checkResourcePermission('session', 'delete'), SessionController.deleteSession);

export default router;