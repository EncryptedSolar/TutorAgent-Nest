import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserSessionController } from './user-session.controller';
import { UserSessionService } from './user-session.service';
import { UserSessionEntity } from './user-session.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserSessionEntity])],
  controllers: [UserSessionController],
  providers: [UserSessionService],
  exports: [UserSessionService],
})
export class UserSessionModule {}


