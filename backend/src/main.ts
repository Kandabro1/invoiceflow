import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  // 1. Préfixe global : toutes les routes commencent par /api
  app.setGlobalPrefix('api');

  // 2. Sécurité HTTP
  app.use(helmet());
  app.use(cookieParser());

  // 3. Validation globale
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // 4. Filtre global d'erreurs
  app.useGlobalFilters(new AllExceptionsFilter());

  // 5. CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
    credentials: true,
  });

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
  console.warn(`API démarrée sur http://localhost:${port}/api`);
}

void bootstrap();
