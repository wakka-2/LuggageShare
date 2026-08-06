import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { Logger as PinoLogger } from 'nestjs-pino';
import helmet from 'helmet';
import * as Sentry from '@sentry/node';
import type { Express, Request, Response } from 'express';
import { AppModule } from '../src/app.module';
import { TransformInterceptor } from '../src/common/interceptors';
import { AllExceptionsFilter } from '../src/common/filters';

/**
 * Vercel serverless entrypoint for the NestJS API.
 *
 * The app is created once per warm container and cached. It mirrors the middleware
 * pipeline in src/main.ts (helmet, CORS, global validation, transform interceptor,
 * exception filter, `api/v1` prefix with health excluded) but does not call listen();
 * instead the underlying Express instance is returned and driven by Vercel.
 *
 * We use NestJS's own bundled Express (via getHttpAdapter) rather than importing
 * express directly — the platform requires Express 4, and importing a hoisted
 * Express 5 breaks route parsing (`/api/v1/*`).
 *
 * Scheduled work that used to run via @nestjs/schedule now runs through Vercel Cron
 * (see /api/v1/cron/*), and realtime that used to run via Socket.io now runs through
 * Supabase broadcast.
 */
let cachedServer: Express | undefined;

async function bootstrapServer(): Promise<Express> {
  if (process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV || 'production',
      tracesSampleRate: 0.2,
    });
  }

  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  app.useLogger(app.get(PinoLogger));
  app.use(helmet());

  const corsOrigins = process.env.CORS_ORIGINS?.split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  app.enableCors({
    origin: corsOrigins && corsOrigins.length ? corsOrigins : true,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    })
  );
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());
  app.setGlobalPrefix('api/v1', { exclude: ['health', 'health/ready'] });

  await app.init();
  return app.getHttpAdapter().getInstance() as Express;
}

export default async function handler(req: Request, res: Response): Promise<void> {
  if (!cachedServer) {
    cachedServer = await bootstrapServer();
  }
  cachedServer(req, res);
}
