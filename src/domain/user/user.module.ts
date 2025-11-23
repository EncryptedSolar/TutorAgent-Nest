import { Module } from '@nestjs/common';
import { UsersController } from './user.controller';
import { UsersService } from './user.service';
import { PrismaModule } from 'src/core/prisma/prisma.module';
import { UserResolver } from './user.resolver';
import { UserEventModule } from '../audit/user-event.module';

@Module({
  imports: [PrismaModule, UserEventModule],
  controllers: [UsersController],
  providers: [UserResolver, UsersService],
  exports: [UsersService], // export so AuthModule can use it
})
export class UsersModule { }
