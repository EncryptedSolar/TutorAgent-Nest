import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../user/user.module';
import { UserSessionModule } from '../user-session-management/user-session.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from 'src/common/strategies/jwt.strategy';
import { LocalStrategy } from 'src/common/strategies/local.strategy';
import { CommonModule } from 'src/common/common.module';
import { JwtUtilsService } from './utils/jwt-utils.service';

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
