import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { requireAuth, requireAdmin } from '../middleware/auth';
import { checkResourcePermission } from '../middleware/permissions';

const router = Router();

// All user routes require authentication
router.use(requireAuth);

// Available to all authenticated users
router.get('/names', UserController.getUserNames);

// Admin only routes
router.get('/', requireAdmin, UserController.listUsers);
router.post('/', requireAdmin, UserController.createUser);

// Resource-specific permission checks
router.put('/:id', checkResourcePermission('user', 'edit'), UserController.updateUser);
router.delete('/:id', requireAdmin, UserController.deleteUser);

export default router;