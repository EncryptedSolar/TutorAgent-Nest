import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../user/user.module';
import { UserSessionModule } from '../user-session-management/user-session.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from 'src/domain/auth/strategies/jwt.strategy';
import { LocalStrategy } from 'src/domain/auth/strategies/local.strategy';
import { CommonModule } from 'src/common/common.module';
import { JwtUtilsService } from './utils/jwt-utils.service';
import { PrismaModule } from 'src/core/prisma/prisma.module';

@Module({
    imports: [
        UsersModule,
        UserSessionModule,
        PrismaModule,
        CommonModule,
        JwtModule.register({
            secret: process.env.JWT_SECRET,
            signOptions: { expiresIn: '1d' },
        }),
    ],
    controllers: [AuthController],
    providers: [
        AuthService,
        JwtStrategy,
        LocalStrategy,
        JwtUtilsService
    ],
    exports: [AuthService, JwtUtilsService],
})
export class AuthModule { }
