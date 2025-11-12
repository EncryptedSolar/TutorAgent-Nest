import { Module } from '@nestjs/common';
import { UsersController } from './user.controller';
import { UsersService } from './user.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UserResolver } from './user.resolver';

@Module({
  imports: [PrismaModule],
  controllers: [UsersController],
  providers: [UserResolver, UsersService],
  exports: [UsersService], // export so AuthModule can use it
})
export class UsersModule { }
