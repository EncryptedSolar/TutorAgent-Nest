import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { LocalStrategy } from './local.strategy';
import { JwtStrategy } from './jwt.strategy';
import { UsersModule } from 'src/user/user.module';
import 'dotenv/config'
import { WsJwtGuard } from './ws.jwt.guard';

@Module({
    imports: [
        forwardRef(() => UsersModule), // <-- wrap in forwardRef        
        PassportModule,
        JwtModule.register({
            secret: process.env.JWT__ACCESS_SECRET,
        }),
    ],
    providers: [AuthService, LocalStrategy, JwtStrategy, WsJwtGuard],
    controllers: [AuthController],
    exports: [AuthService, JwtModule, WsJwtGuard],
})
export class AuthModule { }
