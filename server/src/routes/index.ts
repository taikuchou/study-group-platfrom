import { Router } from 'express';
import authRoutes from './auth';
import userRoutes from './users';
import topicRoutes from './topics';
import sessionRoutes from './sessions';
import interactionRoutes from './interactions';
import { SessionController } from '../controllers/sessionController';
import { InteractionController } from '../controllers/interactionController';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Mount route modules
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/topics', topicRoutes);
router.use('/sessions', sessionRoutes);
router.use('/interactions', interactionRoutes);

// Additional nested routes for better API structure  
router.get('/topics/:id/sessions', requireAuth as any, SessionController.getSessionsByTopic);
router.get('/sessions/:id/interactions', requireAuth as any, InteractionController.getInteractionsBySession);

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Study Group Platform API',
  });
});

export default router;