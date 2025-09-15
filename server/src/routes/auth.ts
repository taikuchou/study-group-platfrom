import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/login', AuthController.login);
router.post('/register', AuthController.register);
router.post('/signup', AuthController.register); // Alias for register
router.post('/google', AuthController.googleAuth); // Google OAuth authentication
router.post('/refresh', AuthController.refresh);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);

// Protected routes
router.get('/me', requireAuth as any, AuthController.me);
router.post('/logout', requireAuth as any, AuthController.logout);
router.post('/complete-profile', requireAuth as any, AuthController.completeGoogleProfile);

export default router;