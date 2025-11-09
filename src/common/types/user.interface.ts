import { AuthMethod, User } from '@prisma/client';

// Full entity type (same as your DB model)
export type UserEntity = User;

// Safe user type for responses (no sensitive fields)
export type SafeUser = Pick<
  UserEntity,
  'id' | 'email' | 'name' | 'username' | 'role' | 'picture' | 'isGoogleUser' | 'preferredAuth' | 'hasPasskey' | 'currentStatus'
>;

export interface ActiveUsersQuery {
  limit?: number;
  region?: string;
  accountType?: AuthMethod;
  createdAfter?: Date;
  createdBefore?: Date;
}

export interface UserSessionHistoryQuery {
  userId: string;
  from?: Date;
  to?: Date;
  limit?: number;
}

export interface RequestWithMetadata extends Request {
  ip?: string;            // optional IP property
  region?: string; // optional region from headers or frontend
  deviceInfo?: string; // optional device info from frontend
  // Add connection to satisfy TypeScript
  connection?: {
    remoteAddress?: string;
  };
}
