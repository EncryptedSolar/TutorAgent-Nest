import { registerAs } from '@nestjs/config';

export const sessionConfig = registerAs('session', () => ({
  sessionIdleTimeoutMinutes: process.env.SESSION_IDLE_TIMEOUT_MINUTES || '15',
  sessionOfflineTimeoutMinutes: process.env.SESSION_OFFLINE_TIMEOUT_MINUTES || '60',
}));