import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { TerminusModule } from '@nestjs/terminus';
import { LoggerModule } from 'nestjs-pino';
import * as Joi from 'joi';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ListingsModule } from './modules/listings/listings.module';
import { FlightsModule } from './modules/flights/flights.module';
import { OffersModule } from './modules/offers/offers.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { MessagesModule } from './modules/messages/messages.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { DisputesModule } from './modules/disputes/disputes.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { PrismaModule } from './prisma/prisma.module';
import { HealthController } from './health.controller';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
        DATABASE_URL: Joi.string().required(),
        JWT_SECRET: Joi.string().min(32).required(),
        JWT_REFRESH_SECRET: Joi.string().min(32).required(),
        JWT_EXPIRES_IN: Joi.string().default('1h'),
        JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),
        GOOGLE_CLIENT_ID: Joi.string().optional(),
        APPLE_CLIENT_ID: Joi.string().optional(),
        CORS_ORIGINS: Joi.string().when('NODE_ENV', {
          is: 'production',
          then: Joi.required(),
          otherwise: Joi.optional(),
        }),
        DEV_LOGIN_ENABLED: Joi.boolean().default(false),
        SUPABASE_URL: Joi.string().optional().default(''),
        SUPABASE_SERVICE_KEY: Joi.string().optional().default(''),
        R2_ACCOUNT_ID: Joi.string().optional().default(''),
        R2_ACCESS_KEY_ID: Joi.string().optional().default(''),
        R2_SECRET_ACCESS_KEY: Joi.string().optional().default(''),
        R2_BUCKET_NAME: Joi.string().optional().default('luggageshare'),
        R2_PUBLIC_URL: Joi.string().optional().default(''),
        SENTRY_DSN: Joi.string().uri().optional().default(''),
        API_PORT: Joi.number().default(3001),
      }),
      validationOptions: {
        abortEarly: false,
      },
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        autoLogging: true,
        transport:
          process.env.NODE_ENV !== 'production'
            ? { target: 'pino-pretty', options: { colorize: true, singleLine: true } }
            : undefined,
        level: process.env.NODE_ENV !== 'production' ? 'debug' : 'info',
        serializers: {
          req: (req) => ({ method: req.method, url: req.url }),
          res: (res) => ({ statusCode: res.statusCode }),
        },
      },
    }),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 10,
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 50,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 200,
      },
    ]),
    ScheduleModule.forRoot(),
    TerminusModule,
    PrismaModule,
    AuthModule,
    UsersModule,
    ListingsModule,
    FlightsModule,
    OffersModule,
    BookingsModule,
    MessagesModule,
    NotificationsModule,
    ReviewsModule,
    WalletModule,
    DisputesModule,
    UploadsModule,
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
