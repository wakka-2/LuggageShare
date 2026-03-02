import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Logger as PinoLogger } from 'nestjs-pino';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptors';
import { AllExceptionsFilter } from './common/filters';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(PinoLogger));

  // Security
  app.use(helmet());

  // CORS — production requires CORS_ORIGINS env var
  const corsOrigins = process.env.CORS_ORIGINS?.split(',');
  app.enableCors({
    origin:
      process.env.NODE_ENV === 'production'
        ? corsOrigins || []
        : corsOrigins || ['http://localhost:3000', 'http://localhost:8081'],
    credentials: true,
  });

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  );

  // Global interceptors & filters
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());

  // API prefix
  app.setGlobalPrefix('api/v1');

  // Swagger documentation — disabled in production
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('LuggageShare API')
      .setDescription('API documentation for LuggageShare platform')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('auth', 'Authentication endpoints')
      .addTag('users', 'User management')
      .addTag('listings', 'Carrier listings')
      .addTag('bookings', 'Booking management')
      .addTag('messages', 'Chat and messaging')
      .addTag('notifications', 'Push notifications')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);
  }

  // Graceful shutdown
  app.enableShutdownHooks();

  const port = process.env.API_PORT || 3001;
  await app.listen(port);

  const logger = new Logger('Bootstrap');
  logger.log(`API running on http://localhost:${port}`);
  if (process.env.NODE_ENV !== 'production') {
    logger.log(`Swagger docs: http://localhost:${port}/docs`);
  }
}

bootstrap();
