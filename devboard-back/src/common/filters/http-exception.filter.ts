import { type ArgumentsHost, Catch, type ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import type { Request, Response } from 'express';

interface ErrorResponse {
  statusCode: number;
  message: string | string[];
  error: string;
  path: string;
  timestamp: string;
}

/**
 * Global exception filter — catches ALL errors and returns a consistent JSON shape:
 * { statusCode, message, error, path, timestamp }
 *
 * This means validation errors, domain errors (NotFoundException, etc.), and
 * unexpected runtime errors all produce the same response envelope.
 * Stack traces are never leaked in error messages.
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse = exception instanceof HttpException ? exception.getResponse() : null;

    let message: string | string[];
    if (typeof exceptionResponse === 'object' && exceptionResponse !== null && 'message' in exceptionResponse) {
      message = (exceptionResponse as Record<string, unknown>).message as string | string[];
    } else if (exception instanceof Error && status < 500) {
      message = exception.message;
    } else {
      // Never expose internal error details to the client
      message = 'Internal server error';
    }

    const body: ErrorResponse = {
      statusCode: status,
      message,
      error: HttpStatus[status] ?? 'UNKNOWN_ERROR',
      path: request.url,
      timestamp: new Date().toISOString(),
    };

    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url} → ${status}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    } else if (status >= 400) {
      this.logger.warn(`${request.method} ${request.url} → ${status}: ${JSON.stringify(message)}`);
    }

    response.status(status).json(body);
  }
}
