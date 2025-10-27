import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { UserSessionService } from 'src/user-session-management/user-session.service';

@Injectable()
export class ActivityInterceptor implements NestInterceptor {
  constructor(private readonly userSessionService: UserSessionService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    // The JWT guard should have already attached the decoded token payload
    const user = request.user;

    if (user && user.jti) {
      // Fire and forget — don't await to avoid blocking the request
      this.userSessionService
        .updateActivity(user.jti)
        .catch((err) =>
          console.error(`Failed to update activity for ${user.jti}`, err),
        );
    }

    // Continue request lifecycle
    return next.handle().pipe(
      tap(() => {
        // Could log response or track analytics here in future
      }),
    );
  }
}
