import { AuthMethod, User } from "generated/prisma/client";

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
  // Server-determined
  ip: string;                   // Client IP (always set by server)
  connection?: {                 // optional, for legacy support
    remoteAddress?: string;
  };

  // Frontend-provided (optional)
  region?: string;               // e.g., from headers or frontend
  deviceInfo?: string;           // e.g., user-agent, device metadata
}