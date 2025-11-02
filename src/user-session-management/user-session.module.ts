import { Module } from '@nestjs/common';
import { UserSessionController } from './user-session.controller';
import { UserSessionService } from './user-session.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { SessionSchedulerService } from './session.scheduler';

@Module({
  imports: [PrismaModule],
  controllers: [UserSessionController],
  providers: [UserSessionService, SessionSchedulerService],
  exports: [UserSessionService],
})
export class UserSessionModule { }


