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

  // Allow requests from your frontend
  app.enableCors({
    origin: 'http://localhost:5173', // or '*' for all origins (less secure)
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true, // if you need cookies/auth headers
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
