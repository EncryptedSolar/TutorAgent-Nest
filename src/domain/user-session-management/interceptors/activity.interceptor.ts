import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { GqlExecutionContext } from '@nestjs/graphql';
import { UserSessionService } from '../user-session.service';

@Injectable()
export class ActivityInterceptor implements NestInterceptor {
  constructor(private readonly userSessionService: UserSessionService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // Try to get the user depending on the context type
    let user: any;

    if (context.getType<'http'>() === 'http') {
      const request = context.switchToHttp().getRequest();
      user = request.user;
    } else if (context.getType<'graphql'>() === 'graphql') {
      const gqlCtx = GqlExecutionContext.create(context);
      const request = gqlCtx.getContext().req;
      user = request?.user;
    } else if (context.getType<'ws'>() === 'ws') {
      const client = context.switchToWs().getClient();
      user = client?.data?.user;
    }

    // Safely handle user session activity
    if (user && user.jti) {
      this.userSessionService
        .updateActivity(user.jti)
        .catch((err) =>
          console.error(`Failed to update activity for ${user.jti}`, err),
        );
    }

    return next.handle().pipe(
      tap(() => {
        // Optional: log success, response time, etc.
      }),
    );
  }
}
