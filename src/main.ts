import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggerService } from './utils/logger';
import 'dotenv/config'

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Conditionally start the logging pipeline
  if (process.env.NODE_ENV === 'development') {
    const logger = app.get(LoggerService);
  }

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
