import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { AppConfigModule } from './core/config/app.config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { PrismaModule } from './core/prisma/prisma.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import './common/enums/graphql.enum';
import { CommonModule } from './common/common.module';
import { UsersModule } from './domain/user/user.module';
import { AgentModule } from './domain/agent/agent.module';
import { AuthModule } from './domain/auth/auth.module';
import { UserSessionModule } from './domain/user-session-management/user-session.module';
import { ActivityInterceptor } from './domain/user-session-management/interceptors/activity.interceptor';

@Module({
  imports: [
    AppConfigModule,
    UsersModule,
    AuthModule,
    UserSessionModule,
    PrismaModule,
    AgentModule,
    CommonModule,
    ScheduleModule.forRoot(),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      context: ({ req }) => ({ req }), // important!
    }),
  ],
  controllers: [],
  providers: [
    AppService,
    /* NestJS automatically registers interceptor as a global interceptor.
    It runs for every request handled by any controller in the app. */
    {
      provide: APP_INTERCEPTOR,
      useClass: ActivityInterceptor,
    }
  ],
})
export class AppModule { }
