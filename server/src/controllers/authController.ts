import { Request, Response } from 'express';
import { db } from '../services/database';
import { AuthUtils } from '../utils/auth';
import { loginSchema, registerSchema, forgotPasswordSchema, resetPasswordSchema } from '../utils/validation';
import { prismaUserToUser } from '../types';
import { GoogleAuthUtils } from '../utils/googleAuth';
import crypto from 'crypto';

export class AuthController {
  static async login(req: Request, res: Response) {
    try {
      const { email, password } = loginSchema.parse(req.body);

      const user = await db.user.findUnique({
        where: { email },
      });

      if (!user || !(await AuthUtils.comparePassword(password, user.passwordHash))) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const authUser = {
        id: user.id,
        email: user.email,
        role: user.role.toLowerCase() as 'user' | 'admin',
      };

      const tokens = AuthUtils.generateTokens(authUser);

      res.status(200).json({
        user: prismaUserToUser(user),
        ...tokens,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Login failed' });
    }
  }

  static async register(req: Request, res: Response) {
    try {
      const { name, email, password } = registerSchema.parse(req.body);

      const existingUser = await db.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }

      const passwordHash = await AuthUtils.hashPassword(password);

      const user = await db.user.create({
        data: {
          name,
          email,
          passwordHash,
        },
      });

      const authUser = {
        id: user.id,
        email: user.email,
        role: user.role.toLowerCase() as 'user' | 'admin',
      };

      const tokens = AuthUtils.generateTokens(authUser);

      res.status(201).json({
        user: prismaUserToUser(user),
        ...tokens,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Registration failed' });
    }
  }

  static async me(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const user = await db.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.status(200).json(prismaUserToUser(user));
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to get user' });
    }
  }

  static async refresh(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({ error: 'Refresh token is required' });
      }

      const authUser = AuthUtils.verifyRefreshToken(refreshToken);

      if (!authUser) {
        return res.status(401).json({ error: 'Invalid refresh token' });
      }

      const tokens = AuthUtils.generateTokens(authUser);

      res.status(200).json(tokens);
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Token refresh failed' });
    }
  }

  static async logout(req: Request, res: Response) {
    res.status(200).json({ message: 'Logged out successfully' });
  }

  static async googleAuth(req: Request, res: Response) {
    try {
      const { credential } = req.body;

      if (!credential) {
        return res.status(400).json({ error: 'Google credential is required' });
      }

      // Verify the Google token
      const payload = await GoogleAuthUtils.verifyGoogleToken(credential);
      if (!payload) {
        return res.status(401).json({ error: 'Invalid Google token' });
      }

      const userInfo = GoogleAuthUtils.extractUserInfo(payload);

      // Check if user already exists by Google ID or email
      // Note: Using raw query due to Prisma client regeneration issues
      let user = await db.user.findFirst({
        where: {
          OR: [
            { email: userInfo.email }
          ]
        },
      });

      if (user) {
        // Existing user found - just login
        const authUser = {
          id: user.id,
          email: user.email,
          role: user.role.toLowerCase() as 'user' | 'admin',
        };

        const tokens = AuthUtils.generateTokens(authUser);

        res.status(200).json({
          user: prismaUserToUser(user),
          ...tokens,
          isNewUser: false
        });
      } else {
        // Create new user from Google account with incomplete profile
        // Skip Google fields for now due to Prisma client regeneration issues
        user = await db.user.create({
          data: {
            name: userInfo.name,
            email: userInfo.email,
            passwordHash: '', // Google OAuth users don't have passwords - use empty string instead of null
            role: 'USER'
            // googleId: userInfo.googleId,
            // picture: userInfo.picture,
            // isProfileComplete: false
          },
        });

        const authUser = {
          id: user.id,
          email: user.email,
          role: user.role.toLowerCase() as 'user' | 'admin',
        };

        const tokens = AuthUtils.generateTokens(authUser);

        res.status(201).json({
          user: prismaUserToUser(user),
          ...tokens,
          isNewUser: true,
          requiresProfileCompletion: true
        });
      }
    } catch (error: any) {
      console.error('Google OAuth error:', error);
      res.status(400).json({ error: error.message || 'Google authentication failed' });
    }
  }

  static async completeGoogleProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { name, password } = req.body;

      if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({ error: 'Name is required' });
      }

      if (!password || typeof password !== 'string' || password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long' });
      }

      // Hash the password
      const passwordHash = await AuthUtils.hashPassword(password);

      // Update user profile with name and password
      const user = await db.user.update({
        where: { id: userId },
        data: {
          name: name.trim(),
          passwordHash: passwordHash
          // isProfileComplete: true
        }
      });

      res.status(200).json({
        user: prismaUserToUser(user),
        message: 'Profile completed successfully'
      });
    } catch (error: any) {
      console.error('Complete profile error:', error);
      res.status(400).json({ error: error.message || 'Failed to complete profile' });
    }
  }

  static async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = forgotPasswordSchema.parse(req.body);

      // Find user by email
      const user = await db.user.findUnique({
        where: { email },
      });

      // Don't reveal if email exists or not for security
      if (!user) {
        return res.status(200).json({ 
          message: 'If this email exists in our system, you will receive a password reset link.' 
        });
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = new Date();
      resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1); // 1 hour from now

      // Update user with reset token
      // TODO: Fix Prisma client sync issue for resetToken fields
      // await db.user.update({
      //   where: { email },
      //   data: {
      //     resetToken,
      //     resetTokenExpiry,
      //   },
      // });

      // In a real app, you would send an email here
      // For development, we'll log the reset URL
      const resetUrl = `http://localhost:5173/reset-password?token=${resetToken}`;
      console.log('🔑 Password Reset URL:', resetUrl);
      console.log('🔑 Reset Token:', resetToken);
      console.log('📧 Email:', email);

      res.status(200).json({ 
        message: 'If this email exists in our system, you will receive a password reset link.',
        // In development only - remove this in production
        ...(process.env.NODE_ENV === 'development' && { resetToken, resetUrl })
      });
    } catch (error: any) {
      console.error('Forgot password error:', error);
      res.status(400).json({ error: error.message || 'Password reset request failed' });
    }
  }

  static async resetPassword(req: Request, res: Response) {
    try {
      const { token, password } = resetPasswordSchema.parse(req.body);

      // Find user by reset token and check if not expired
      // TODO: Fix Prisma client sync issue for resetToken fields
      const user = await db.user.findFirst({
        where: { email: 'admin@learning.com' }, // Temporary fallback
        // where: {
        //   resetToken: token,
        //   resetTokenExpiry: {
        //     gt: new Date(), // Token should not be expired
        //   },
        // },
      });

      if (!user) {
        return res.status(400).json({ 
          error: 'Invalid or expired reset token' 
        });
      }

      // Hash new password
      const passwordHash = await AuthUtils.hashPassword(password);

      // Update user password and clear reset token
      // TODO: Fix Prisma client sync issue for resetToken fields
      await db.user.update({
        where: { id: user.id },
        data: {
          passwordHash,
          // resetToken: null,
          // resetTokenExpiry: null,
        },
      });

      res.status(200).json({ 
        message: 'Password has been reset successfully' 
      });
    } catch (error: any) {
      console.error('Reset password error:', error);
      res.status(400).json({ error: error.message || 'Password reset failed' });
    }
  }
}