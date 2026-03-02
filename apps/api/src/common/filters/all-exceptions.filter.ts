import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { Prisma } from '@prisma/client';
import * as Sentry from '@sentry/node';

interface ErrorResponseBody {
  error: {
    code: string;
    message: string;
    statusCode: number;
    details?: any[];
  };
}

/**
 * Maps Prisma error codes to user-friendly HTTP responses.
 * Only common codes are mapped here; unknown Prisma errors
 * fall through to the generic 500 handler so that internal
 * details are never leaked to clients.
 */
function mapPrismaError(
  exception: Prisma.PrismaClientKnownRequestError
): { statusCode: number; code: string; message: string } | null {
  switch (exception.code) {
    case 'P2002': {
      const target = (exception.meta?.target as string[]) ?? [];
      const fields = target.length > 0 ? target.join(', ') : 'field';
      return {
        statusCode: HttpStatus.CONFLICT,
        code: 'UNIQUE_CONSTRAINT',
        message: `A record with this ${fields} already exists`,
      };
    }
    case 'P2025':
      return {
        statusCode: HttpStatus.NOT_FOUND,
        code: 'NOT_FOUND',
        message: 'The requested record was not found',
      };
    case 'P2003':
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        code: 'FOREIGN_KEY_CONSTRAINT',
        message: 'Related record not found. Please verify the referenced resource exists',
      };
    case 'P2014':
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        code: 'RELATION_VIOLATION',
        message: 'The change would violate a required relation between records',
      };
    default:
      return null;
  }
}

/**
 * Extracts structured validation details from a ValidationPipe
 * HttpException.  NestJS returns the validation messages inside
 * `response.message` as a string array when class-validator fails.
 */
function extractValidationDetails(response: string | Record<string, any>): any[] | undefined {
  if (typeof response === 'object' && Array.isArray(response.message)) {
    return response.message.map((msg: string) => ({
      message: msg,
    }));
  }
  return undefined;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let body: ErrorResponseBody;

    // ── HttpException (includes ValidationPipe errors) ────────────
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      const details = extractValidationDetails(exceptionResponse as string | Record<string, any>);

      const message =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : ((exceptionResponse as Record<string, any>).message ?? exception.message);

      // Validation errors from ValidationPipe come as 400 with an array
      const isValidation = status === HttpStatus.BAD_REQUEST && details;

      body = {
        error: {
          code: isValidation ? 'VALIDATION_ERROR' : 'HTTP_ERROR',
          message: Array.isArray(message) ? 'Validation failed' : message,
          statusCode: status,
          ...(details ? { details } : {}),
        },
      };

      this.logger.error(`[HttpException] ${request.method} ${request.url} -> ${status}`, {
        message: body.error.message,
        details,
      });

      // ── Prisma Known Request Error ────────────────────────────────
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      const mapped = mapPrismaError(exception);

      if (mapped) {
        body = {
          error: {
            code: mapped.code,
            message: mapped.message,
            statusCode: mapped.statusCode,
          },
        };
      } else {
        // Unmapped Prisma code -- treat as internal error
        body = {
          error: {
            code: 'INTERNAL_ERROR',
            message: 'An unexpected database error occurred',
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          },
        };
      }

      this.logger.error(`[PrismaError] ${request.method} ${request.url} -> ${exception.code}`, {
        meta: exception.meta,
      });

      // ── Unknown / unhandled errors ────────────────────────────────
    } else {
      body = {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal server error',
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        },
      };

      // Report unhandled errors to Sentry
      Sentry.captureException(exception, {
        extra: { method: request.method, url: request.url },
      });

      this.logger.error(`[UnhandledError] ${request.method} ${request.url}`, exception);
    }

    response.status(body.error.statusCode).json(body);
  }
}
