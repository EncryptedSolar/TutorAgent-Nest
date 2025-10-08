import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const client: Socket = context.switchToWs().getClient<Socket>();
    const token = client.handshake.auth?.token || client.handshake.query?.token;

    if (!token) return false;

    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_ACCESS_SECRET,
      });
      // Attach user info to socket for later use
      client.data.user = { userId: payload.sub, email: payload.email, role: payload.role };
      return true;
    } catch (err) {
      return false;
    }
  }
}
