import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SocketGateway } from './socket/socket.gateway';
import { AppConfigModule } from './config/app.config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ActivityInterceptor } from './common/interceptors/activity.interceptor';
import { UserSessionModule } from './user-session-management/user-session.module';

@Module({
  imports: [
    AppConfigModule,
    UsersModule,
    AuthModule,
    UserSessionModule,
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: ':memory:', // in-memory DB
      autoLoadEntities: true, // auto-load entities
      synchronize: true,    // auto-create tables
      dropSchema: true,     // reset DB on every server restart
      logging: true,
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    SocketGateway,
    /* NestJS automatically registers interceptor as a global interceptor.
    It runs for every request handled by any controller in the app. */
    {
      provide: APP_INTERCEPTOR,
      useClass: ActivityInterceptor,
    }
  ],
})
export class AppModule { }
