import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserEventService } from './user-event.service';

@Module({
  providers: [UserEventService, PrismaService],
  exports: [UserEventService], // ✅ so other modules can inject it
})
export class UserEventModule {}
