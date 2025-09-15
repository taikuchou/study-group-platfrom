import { Router } from 'express';
import { TopicController } from '../controllers/topicController';
import { requireAuth } from '../middleware/auth';
import { checkResourcePermission } from '../middleware/permissions';

const router = Router();

// All topic routes require authentication
router.use(requireAuth);

// Public authenticated routes
router.get('/', TopicController.listTopics);
router.post('/', checkResourcePermission('topic', 'create'), TopicController.createTopic);

// Resource-specific routes
router.get('/:id', checkResourcePermission('topic', 'read'), TopicController.getTopic);
router.put('/:id', checkResourcePermission('topic', 'edit'), TopicController.updateTopic);
router.delete('/:id', checkResourcePermission('topic', 'delete'), TopicController.deleteTopic);

// Topic membership routes
router.post('/:id/join', TopicController.joinTopic);
router.delete('/:id/leave', TopicController.leaveTopic);

export default router;