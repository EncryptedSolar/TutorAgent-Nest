import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decoratos/roles.decorator';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) { }

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no roles are required, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }


    // Handle GraphQL requests
    if (context.getType<'graphql'>() === 'graphql') {
      const gqlCtx = GqlExecutionContext.create(context);
      const user = gqlCtx.getContext().req.user; // ✅ correct for GraphQL

      if (!user) throw new ForbiddenException('User not found in GraphQL context');
      if (!requiredRoles.includes(user.role)) {
        throw new ForbiddenException(`Forbidden: Role "${user.role}" not allowed`);
      }

      return true;
    }

    // Handle HTTP requests
    if (context.getType() === 'http') {
      const request = context.switchToHttp().getRequest();
      const user = request.user;

      if (!user) throw new ForbiddenException('User not found in request context');
      if (!requiredRoles.includes(user.role)) {
        throw new ForbiddenException(`Forbidden: Role "${user.role}" not allowed`);
      }

      return true;
    }

    // Handle WebSocket contexts
    if (context.getType() === 'ws') {
      const client = context.switchToWs().getClient();
      const user = client.data?.user;

      if (!user) throw new ForbiddenException('User not found in socket context');
      if (!requiredRoles.includes(user.role)) {
        throw new ForbiddenException(`Forbidden: Role "${user.role}" not allowed`);
      }

      return true;
    }

    return false;
  }
}
