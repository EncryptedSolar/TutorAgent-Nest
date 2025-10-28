import { Request } from 'express';
import { User } from 'src/user/user.entity';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  jti?: string;
}

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  user?: SafeUser;
}

export interface SafeUser {
  id: string;
  email: string;
  role: string;
  name?: string;
  username?: string;
  picture?: string | null;
}

export interface RequestWithUser extends Request {
  user: User;
}

export interface RequestWithBody<T> extends Request {
  body: T;
}
