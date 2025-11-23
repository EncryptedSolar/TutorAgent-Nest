import { Module } from '@nestjs/common';
import { JwtAuthGuard } from './guards/jwt.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { WsJwtGuard } from './guards/ws-jwt.guard';
import { JwtModule } from '@nestjs/jwt';
import { AppConfigModule } from 'src/core/config/app.config';

@Module({
  imports: [
    AppConfigModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
  ],
  providers: [
    JwtAuthGuard,
    LocalAuthGuard,
    RolesGuard,
    WsJwtGuard,
  ],
  exports: [
    JwtAuthGuard,
    LocalAuthGuard,
    RolesGuard,
    WsJwtGuard,
  ],
})
export class CommonModule { }
