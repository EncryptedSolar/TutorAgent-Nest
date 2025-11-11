import { Module } from '@nestjs/common';
import { UserSessionService } from './user-session.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UserSessionResolver } from './user-session.resolver';
import { UsersModule } from 'src/user/user.module';
import { UserEventModule } from 'src/audit/user-event.module';

@Module({
  imports: [PrismaModule, UsersModule, UserEventModule],
  controllers: [],
  providers: [UserSessionService, UserSessionResolver],
  exports: [UserSessionService],
})
export class UserSessionModule { }


