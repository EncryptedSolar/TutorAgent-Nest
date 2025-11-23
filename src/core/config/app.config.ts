import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { openaiConfig } from './openai.config';
import { jwtConfig } from './jwt.config';
import { validateEnv } from './validation';
import { googleConfig } from './google.config';
import { sessionConfig } from './session.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [openaiConfig, jwtConfig, googleConfig, sessionConfig],
      validate: validateEnv, // optional but recommended
    }),
  ],
})
export class AppConfigModule {}
