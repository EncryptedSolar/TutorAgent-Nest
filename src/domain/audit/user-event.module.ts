import { Module } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { UserEventService } from './user-event.service';
import { UserEventResolver } from './user-event.resolver';

@Module({
  providers: [UserEventResolver, UserEventService, PrismaService],
  exports: [UserEventService], // ✅ so other modules can inject it
})
export class UserEventModule {}
