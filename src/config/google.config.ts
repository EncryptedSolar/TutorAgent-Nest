import { registerAs } from '@nestjs/config';

export const googleConfig = registerAs('google', () => ({
  googleSecret: process.env.GOOGLE_CLIENT_SECRET,
  googleClientId: process.env.GOOGLE_CLIENT_ID,
}));