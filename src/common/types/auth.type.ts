import { Request } from 'express';
import { User, Role } from '@prisma/client'; // Prisma types

// JWT payload
export interface JwtPayload {
  sub: string;      // user.id
  email: string;
  role: Role;       // Prisma Role enum
  jti?: string;
}

// The safe subset of a user to return to clients
export interface SafeUser {
  id: string;
  email: string;
  role: Role;
  name?: string;
  username?: string;
  picture?: string | null;
}

// Response from login/register/refresh
export interface TokenPair {
  access_token: string;
  refresh_token: string;
  user?: SafeUser;
}

// Strongly typed return for issueTokensForUser
export interface TokensForUser {
  access_token: string;
  refresh_token: string;
  safeUser: SafeUser;
  jti: string;
}

// Request types with user or body
export interface RequestWithUser extends Request {
  user: User; // Prisma User
}

export interface RequestWithBody<T> extends Request {
  body: T;
}


export interface TokensForUser {
  access_token: string;
  refresh_token: string;
  safeUser: SafeUser;
  jti: string;
}

export type PrismaSafeUser = Omit<User, 'password'>;