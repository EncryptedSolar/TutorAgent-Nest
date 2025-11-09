import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { SocketGateway } from './socket/socket.gateway';
import { AppConfigModule } from './config/app.config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ActivityInterceptor } from './common/interceptors/activity.interceptor';
import { UserSessionModule } from './user-session-management/user-session.module';
import { PrismaModule } from './prisma/prisma.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import './common/enums/graphql.enum'; // ensures enums are registered before schema generation

@Module({
  imports: [
    AppConfigModule,
    UsersModule,
    AuthModule,
    UserSessionModule,
    PrismaModule,
    ScheduleModule.forRoot(),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      context: ({ req }) => ({ req }), // important!
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
