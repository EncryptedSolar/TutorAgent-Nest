// agent/agent.module.ts
import { Module } from '@nestjs/common';
import { AgentGateway } from './agent.gateway';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WsJwtGuard } from 'src/common/guards/ws-jwt.guard';

@Module({
  imports: [
    ConfigModule, // needed if you use ConfigService
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
    }),
  ],
  providers: [AgentGateway, WsJwtGuard],
})
export class AgentModule {}
