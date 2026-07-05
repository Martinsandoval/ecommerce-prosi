import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';

interface ErrorResponseBody {
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  message: string | string[];
  error: string;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { status, message, error } = this.resolveException(exception);

    const body: ErrorResponseBody = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
      error,
    };

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `${request.method} ${request.url} -> ${status}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    response.status(status).json(body);
  }

  private resolveException(exception: unknown): {
    status: HttpStatus;
    message: string | string[];
    error: string;
  } {
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      if (typeof response === 'string') {
        return {
          status: exception.getStatus(),
          message: response,
          error: exception.name,
        };
      }
      const body = response as Record<string, unknown>;
      return {
        status: exception.getStatus(),
        message: (body.message as string | string[]) ?? exception.message,
        error: (body.error as string) ?? exception.name,
      };
    }

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      return this.resolvePrismaError(exception);
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      error: 'InternalServerError',
    };
  }

  private resolvePrismaError(exception: Prisma.PrismaClientKnownRequestError): {
    status: HttpStatus;
    message: string;
    error: string;
  } {
    switch (exception.code) {
      case 'P2025':
        return {
          status: HttpStatus.NOT_FOUND,
          message: 'Resource not found',
          error: 'NotFound',
        };
      case 'P2002':
        return {
          status: HttpStatus.CONFLICT,
          message: 'A resource with these unique fields already exists',
          error: 'Conflict',
        };
      default:
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Database request error',
          error: 'BadRequest',
        };
    }
  }
}
