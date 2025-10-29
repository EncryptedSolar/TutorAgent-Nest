import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from 'src/user/user.module';
import 'dotenv/config'
import { ConfigModule } from '@nestjs/config';
import { JwtUtilsService } from 'src/common/utils/jwt-utils.service';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';
import { LocalStrategy } from 'src/common/strategies/local.strategy';
import { LocalAuthGuard } from 'src/common/guards/local-auth.guard';
import { JwtStrategy } from 'src/common/strategies/jwt.strategy';
import { UserSessionModule } from 'src/user-session-management/user-session.module';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
    imports: [
        UsersModule,
        UserSessionModule,
        ConfigModule,
        PrismaModule,
        JwtModule.register({})
    ],
    providers: [AuthService, JwtUtilsService, LocalAuthGuard, LocalStrategy, JwtAuthGuard, JwtStrategy],
    controllers: [AuthController],
    exports: [AuthService, JwtModule],
})
export class AuthModule { }
