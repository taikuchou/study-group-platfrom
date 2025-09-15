import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { AuthUser, AuthTokens } from '../types';

export class AuthUtils {
  private static jwtSecret = process.env.JWT_SECRET || 'fallback-secret';
  private static jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret';
  private static jwtExpire = process.env.JWT_EXPIRE || '15m';
  private static jwtRefreshExpire = process.env.JWT_REFRESH_EXPIRE || '7d';

  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  static generateTokens(user: AuthUser): AuthTokens {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpire,
    });

    const refreshToken = jwt.sign(payload, this.jwtRefreshSecret, {
      expiresIn: this.jwtRefreshExpire,
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  static verifyAccessToken(token: string): AuthUser | null {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as any;
      return {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
      };
    } catch (error) {
      return null;
    }
  }

  static verifyRefreshToken(token: string): AuthUser | null {
    try {
      const decoded = jwt.verify(token, this.jwtRefreshSecret) as any;
      return {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
      };
    } catch (error) {
      return null;
    }
  }
}