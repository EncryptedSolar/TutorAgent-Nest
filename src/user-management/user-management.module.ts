import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserSession } from './user-session.entity';
import { UserManagementController } from './user.management.controller';
import { UserManagementService } from './user.management.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserSession])],
  controllers: [UserManagementController],
  providers: [UserManagementService],
  exports: [UserManagementService],
})
export class UserManagementModule {}
