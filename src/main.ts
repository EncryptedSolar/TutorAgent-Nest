import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
// in main.ts (for dev only)
// const originalLog = console.log;
// console.log = (...args) => {
//   const safeArgs = args.map(arg =>
//     typeof arg === 'object'
//       ? JSON.stringify(arg, null, 2)
//       : arg
//   );
//   originalLog(...safeArgs);
// };

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 🔧 Access environment variables via ConfigService
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3000);
  const nodeEnv = configService.get<string>('NODE_ENV', 'development');
  const frontendOrigin = configService.get<string>('FRONTEND_ORIGIN', 'http://localhost:5173');

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
