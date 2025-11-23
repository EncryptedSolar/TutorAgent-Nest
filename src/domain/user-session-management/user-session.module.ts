import { Module } from '@nestjs/common';
import { UserSessionService } from './user-session.service';
import { PrismaModule } from 'src/core/prisma/prisma.module';
import { UserSessionResolver } from './user-session.resolver';
import { ActivityInterceptor } from './interceptors/activity.interceptor';
import { UsersModule } from '../user/user.module';
import { UserEventModule } from '../audit/user-event.module';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    UserEventModule,
  ],
  controllers: [],
  providers: [
    UserSessionService,
    UserSessionResolver,
    ActivityInterceptor
  ],
  exports: [UserSessionService],
})
export class UserSessionModule { }


