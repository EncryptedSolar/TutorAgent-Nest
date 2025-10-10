import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggerService } from './common/utils/logger';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 🔧 Access environment variables via ConfigService
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3000);
  const nodeEnv = configService.get<string>('NODE_ENV', 'development');
  const frontendOrigin = configService.get<string>('FRONTEND_ORIGIN', 'http://localhost:5173');

  // 🧠 Conditional logger setup (only in dev)
  if (nodeEnv === 'development') {
    app.get(LoggerService); // if it self-registers its pipes or interceptors
  }

  // 🌐 Enable CORS with environment config
  app.enableCors({
    origin: frontendOrigin,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  await app.listen(port);
  console.log(`🚀 Server running in ${nodeEnv} mode on port ${port}`);
}
bootstrap();
