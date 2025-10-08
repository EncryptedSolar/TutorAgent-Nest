import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { LoggerService } from './utils/logger';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user/user.entity';
import { WsJwtGuard } from './auth/ws.jwt.guard';
import { SocketGateway } from './gateway/socket.gateway';

@Module({
  imports: [
    UsersModule,
    AuthModule,
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: ':memory:', // in-memory DB
      entities: [User],
      synchronize: true,    // auto-create tables
      dropSchema: true,     // reset DB on every server restart
      logging: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService, LoggerService, SocketGateway],
})
export class AppModule { }
