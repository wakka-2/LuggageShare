import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import { PrismaService } from '../prisma/prisma.service';
import { TransformInterceptor } from '../common/interceptors/transform.interceptor';
import { AllExceptionsFilter } from '../common/filters/all-exceptions.filter';

/**
 * API Integration Tests for LuggageShare NestJS backend.
 *
 * These tests boot the full NestJS application (including Prisma, auth, and
 * throttling) and exercise routes through HTTP using supertest.  They validate:
 *
 *  - Health endpoint availability
 *  - Auth endpoint error handling for invalid credentials
 *  - JWT guard enforcement on protected routes
 *  - Public endpoint accessibility (listings search / detail)
 *  - Validation pipe enforcement (missing / malformed request bodies)
 *  - Response envelope structure (TransformInterceptor + AllExceptionsFilter)
 *
 * NOTE: These tests require a reachable DATABASE_URL in .env so Prisma can
 * connect.  They do NOT seed or mutate data; they only issue read requests
 * and intentionally-invalid write requests.
 */
describe('API Integration Tests', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Mirror the production bootstrap pipeline from main.ts
    app.setGlobalPrefix('api/v1');
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
    app.useGlobalInterceptors(new TransformInterceptor());
    app.useGlobalFilters(new AllExceptionsFilter());

    await app.init();

    prisma = app.get(PrismaService);
  }, 30_000); // Allow extra time for module compilation + DB connect

  afterAll(async () => {
    await app.close();
  });

  // ─────────────────────────────────────────────────────────────────────
  // Health Check
  // ─────────────────────────────────────────────────────────────────────
  describe('Health Check', () => {
    it('GET /api/v1/health should return Terminus health check response', () => {
      return request(app.getHttpServer())
        .get('/api/v1/health')
        .expect((res) => {
          // Terminus returns 200 (ok) or 503 (unhealthy) depending on DB connectivity
          expect([200, 503]).toContain(res.status);
          // Body should be an object (either Terminus shape or error envelope)
          expect(typeof res.body).toBe('object');
        });
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // Auth Endpoints (public -- no JWT guard)
  // ─────────────────────────────────────────────────────────────────────
  describe('Auth Endpoints', () => {
    it('POST /api/v1/auth/google should reject invalid Google token', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/google')
        .send({ idToken: 'invalid-token' })
        .expect(401)
        .expect((res) => {
          // AllExceptionsFilter wraps errors in { error: { ... } }
          expect(res.body).toHaveProperty('error');
          expect(res.body.error).toHaveProperty('statusCode', 401);
          expect(res.body.error).toHaveProperty('message');
        });
    });

    it('POST /api/v1/auth/google should reject empty body', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/google')
        .send({})
        .expect(400)
        .expect((res) => {
          expect(res.body).toHaveProperty('error');
          expect(res.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
          expect(res.body.error).toHaveProperty('details');
          expect(Array.isArray(res.body.error.details)).toBe(true);
        });
    });

    it('POST /api/v1/auth/refresh should reject invalid refresh token', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: 'invalid-refresh-token' })
        .expect(401)
        .expect((res) => {
          expect(res.body).toHaveProperty('error');
          expect(res.body.error).toHaveProperty('statusCode', 401);
        });
    });

    it('POST /api/v1/auth/refresh should reject empty body', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({})
        .expect(400)
        .expect((res) => {
          expect(res.body).toHaveProperty('error');
          expect(res.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
        });
    });

    it('POST /api/v1/auth/google should reject unexpected fields (forbidNonWhitelisted)', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/google')
        .send({ idToken: 'some-token', hackerField: 'should-be-rejected' })
        .expect(400)
        .expect((res) => {
          expect(res.body).toHaveProperty('error');
          expect(res.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
        });
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // Protected Endpoints -- must return 401 without Bearer token
  // ─────────────────────────────────────────────────────────────────────
  describe('Protected Endpoints (unauthenticated)', () => {
    // Users
    it('GET /api/v1/users/me should return 401 without auth', () => {
      return request(app.getHttpServer()).get('/api/v1/users/me').expect(401);
    });

    it('PUT /api/v1/users/me should return 401 without auth', () => {
      return request(app.getHttpServer())
        .put('/api/v1/users/me')
        .send({ name: 'Hacker' })
        .expect(401);
    });

    // Bookings
    it('GET /api/v1/bookings should return 401 without auth', () => {
      return request(app.getHttpServer()).get('/api/v1/bookings').expect(401);
    });

    it('POST /api/v1/bookings should return 401 without auth', () => {
      return request(app.getHttpServer())
        .post('/api/v1/bookings')
        .send({ listingId: 'fake-id', weight: 5 })
        .expect(401);
    });

    // Messages
    it('GET /api/v1/messages/conversations should return 401 without auth', () => {
      return request(app.getHttpServer()).get('/api/v1/messages/conversations').expect(401);
    });

    // Notifications
    it('GET /api/v1/notifications should return 401 without auth', () => {
      return request(app.getHttpServer()).get('/api/v1/notifications').expect(401);
    });

    // Reviews
    it('GET /api/v1/reviews/user/some-id should return 401 without auth', () => {
      return request(app.getHttpServer()).get('/api/v1/reviews/user/some-id').expect(401);
    });

    // Wallet
    it('GET /api/v1/wallet/balance should return 401 without auth', () => {
      return request(app.getHttpServer()).get('/api/v1/wallet/balance').expect(401);
    });

    it('GET /api/v1/wallet/history should return 401 without auth', () => {
      return request(app.getHttpServer()).get('/api/v1/wallet/history').expect(401);
    });

    // Disputes
    it('GET /api/v1/disputes/me should return 401 without auth', () => {
      return request(app.getHttpServer()).get('/api/v1/disputes/me').expect(401);
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // Protected Endpoints -- invalid Bearer token
  // ─────────────────────────────────────────────────────────────────────
  describe('Protected Endpoints (invalid token)', () => {
    it('GET /api/v1/users/me should return 401 with malformed Bearer token', () => {
      return request(app.getHttpServer())
        .get('/api/v1/users/me')
        .set('Authorization', 'Bearer totally.invalid.jwt')
        .expect(401);
    });

    it('GET /api/v1/bookings should return 401 with expired-looking token', () => {
      return request(app.getHttpServer())
        .get('/api/v1/bookings')
        .set(
          'Authorization',
          'Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiZXhwIjoxfQ.invalid'
        )
        .expect(401);
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // Public Listings Endpoints (decorated with @Public())
  // ─────────────────────────────────────────────────────────────────────
  describe('Public Listings Endpoints', () => {
    it('GET /api/v1/listings should return 200 without auth (public search)', () => {
      return request(app.getHttpServer())
        .get('/api/v1/listings')
        .expect(200)
        .expect((res) => {
          // TransformInterceptor wraps in { data: ... }
          expect(res.body).toHaveProperty('data');
        });
    });

    it('GET /api/v1/listings should support query parameters', () => {
      return request(app.getHttpServer())
        .get('/api/v1/listings')
        .query({ page: 1, limit: 10, from: 'Riyadh' })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
        });
    });

    it('GET /api/v1/listings/:id should return 404 or structured error for nonexistent listing', () => {
      return request(app.getHttpServer())
        .get('/api/v1/listings/nonexistent-uuid')
        .expect((res) => {
          // Depending on Prisma behavior this may be 404 or 500
          // but should always have the standard error envelope
          expect([400, 404, 500]).toContain(res.status);
          if (res.status !== 200) {
            expect(res.body).toHaveProperty('error');
            expect(res.body.error).toHaveProperty('statusCode');
            expect(res.body.error).toHaveProperty('message');
          }
        });
    });

    it('POST /api/v1/listings should return 401 without auth (create is protected)', () => {
      return request(app.getHttpServer())
        .post('/api/v1/listings')
        .send({ from: 'Riyadh', to: 'Jeddah', availableWeight: 10 })
        .expect(401);
    });

    it('PUT /api/v1/listings/some-id should return 401 without auth', () => {
      return request(app.getHttpServer())
        .put('/api/v1/listings/some-id')
        .send({ availableWeight: 20 })
        .expect(401);
    });

    it('DELETE /api/v1/listings/some-id should return 401 without auth', () => {
      return request(app.getHttpServer()).delete('/api/v1/listings/some-id').expect(401);
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // Response Envelope Structure
  // ─────────────────────────────────────────────────────────────────────
  describe('Response Envelope Structure', () => {
    it('Successful responses should be wrapped in { data: ... } envelope', () => {
      return request(app.getHttpServer())
        .get('/api/v1/listings')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
        });
    });

    it('Error responses should be wrapped in { error: { code, message, statusCode } } envelope', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/google')
        .send({}) // Empty body triggers validation error
        .expect(400)
        .expect((res) => {
          expect(Object.keys(res.body)).toEqual(['error']);
          expect(res.body.error).toHaveProperty('code');
          expect(res.body.error).toHaveProperty('message');
          expect(res.body.error).toHaveProperty('statusCode');
        });
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // 404 Handling for Unknown Routes
  // ─────────────────────────────────────────────────────────────────────
  describe('Unknown Routes', () => {
    it('GET /api/v1/nonexistent should return 404', () => {
      return request(app.getHttpServer()).get('/api/v1/nonexistent').expect(404);
    });

    it('GET /random-path should return 404', () => {
      return request(app.getHttpServer()).get('/random-path').expect(404);
    });
  });
});
