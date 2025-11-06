import { Module } from '@nestjs/common';
import { UserSessionController } from './user-session.controller';
import { UserSessionService } from './user-session.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { SessionSchedulerService } from './session.scheduler';
import { UserSessionResolver } from './user-session.resolver';

@Module({
  imports: [PrismaModule],
  controllers: [UserSessionController],
  providers: [UserSessionService, SessionSchedulerService, UserSessionResolver],
  exports: [UserSessionService],
})
export class UserSessionModule { }


