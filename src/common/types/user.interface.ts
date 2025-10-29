import { User, Role } from '@prisma/client';

// Full entity type (same as your DB model)
export type UserEntity = User;

// Safe user type for responses (no sensitive fields)
export type SafeUser = Omit<
  UserEntity,
  'password' | 'refreshTokenHash'
>;
