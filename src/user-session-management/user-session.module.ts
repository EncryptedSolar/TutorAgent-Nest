import { Module } from '@nestjs/common';
import { UserSessionService } from './user-session.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UserSessionResolver } from './user-session.resolver';
import { UsersModule } from 'src/user/user.module';
import { UserEventModule } from 'src/audit/user-event.module';
import { ActivityInterceptor } from './interceptors/activity.interceptor';

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


