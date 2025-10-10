import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { openaiConfig } from './openai.config';
import { jwtConfig } from './jwt.config';
import { validateEnv } from './validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [openaiConfig, jwtConfig],
      validate: validateEnv, // optional but recommended
    }),
  ],
})
export class AppConfigModule {}
