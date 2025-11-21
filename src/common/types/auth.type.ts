import { Request } from 'express';
import { SafeUser } from '../../common/types/user.interface';
import { Role, User } from 'generated/prisma/client';

// ========================================
// JWT Payload
// ========================================
export interface JwtPayload {
  sub: string;      // user.id
  email: string;
  role: Role;       // Prisma Role enum
  jti?: string;     // JWT ID
}

// ========================================
// Auth Token Structures
// ========================================
export interface TokenPair {
  access_token: string;
  refresh_token: string;
  user?: SafeUser;
}

export interface TokensForUser {
  access_token: string;
  refresh_token: string;
  safeUser: SafeUser;
  jti: string;
}

// ========================================
// Request Types
// ========================================
export interface RequestWithUser extends Request {
  user: User; // full Prisma User; switch to JwtPayload if guards attach only payload
}

export interface RequestWithBody<T> extends Request {
  body: T;
}

// ========================================
// Utility
// ========================================
export type PrismaSafeUser = Omit<User, 'password' | 'refreshTokenHash'>;
